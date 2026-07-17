import { Router } from "express";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { URL } from "url";
import { randomBytes } from "crypto";

const router = Router();

// In-memory store: token → { filePath, filename, expiresAt }
const pendingDownloads = new Map<
  string,
  { filePath: string; filename: string; expiresAt: number }
>();

// Clean up expired entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of pendingDownloads.entries()) {
    if (entry.expiresAt < now) {
      try {
        if (fs.existsSync(entry.filePath)) fs.unlinkSync(entry.filePath);
      } catch { /* best-effort */ }
      pendingDownloads.delete(token);
    }
  }
}, 2 * 60 * 1000);

function isPinterestUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    return (
      host === "pin.it" ||
      host === "pinterest.com" ||
      host.endsWith(".pinterest.com") ||
      host.endsWith(".pinterest.ca") ||
      host.endsWith(".pinterest.co.uk") ||
      host.endsWith(".pinterest.fr") ||
      host.endsWith(".pinterest.de") ||
      host.endsWith(".pinterest.it") ||
      host.endsWith(".pinterest.es") ||
      host.endsWith(".pinterest.se") ||
      host.endsWith(".pinterest.pt") ||
      host.endsWith(".pinterest.nz") ||
      host.endsWith(".pinterest.at") ||
      host.endsWith(".pinterest.mx") ||
      host.endsWith(".pinterest.jp")
    );
  } catch {
    return false;
  }
}

function runYtDlp(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error("TIMEOUT"));
    }, 120_000);

    const proc = spawn("yt-dlp", args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", (code: number | null) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(Object.assign(new Error(`yt-dlp exit ${code}`), { code, stdout, stderr }));
      } else {
        resolve({ stdout, stderr });
      }
    });
    proc.on("error", (err) => { clearTimeout(timeout); reject(err); });
  });
}

interface PinMeta {
  id: string;
  title: string | null;
  hasVideo: boolean;
}

async function getPinMeta(url: string): Promise<PinMeta> {
  let stdout: string;
  try {
    ({ stdout } = await runYtDlp([
      "--dump-json", "--no-playlist", "--no-warnings", url,
    ]));
  } catch (err) {
    const e = err as { stderr?: string };
    const errLower = (e.stderr || "").toLowerCase();
    if (
      errLower.includes("unsupported url") ||
      errLower.includes("no video") ||
      errLower.includes("not a video")
    ) throw new Error("NO_VIDEO");
    if (
      errLower.includes("private") ||
      errLower.includes("unavailable") ||
      errLower.includes("not available") ||
      errLower.includes("not exist") ||
      errLower.includes("login required")
    ) throw new Error("UNAVAILABLE");
    throw err;
  }

  // yt-dlp may emit multiple JSON lines (one per entry); take the last valid one
  const lines = stdout.trim().split("\n");
  let info: Record<string, unknown> | null = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i].trim());
      if (parsed && typeof parsed === "object") { info = parsed; break; }
    } catch { /* skip */ }
  }
  if (!info) throw new Error("PARSE_ERROR");

  // Detect image-only pins: no video formats, or all formats are images
  const formats = (info.formats as Array<Record<string, unknown>>) || [];
  const hasVideoFormats = formats.some(
    (f) => f.vcodec && f.vcodec !== "none" && f.vcodec !== null
  );
  const ext = (info.ext as string || "").toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  if (!hasVideoFormats && isImage) throw new Error("NO_VIDEO");

  return {
    id: (info.id as string) || randomBytes(4).toString("hex"),
    title: (info.title as string) || null,
    hasVideo: true,
  };
}

async function downloadVideo(url: string, pinId: string): Promise<{ filePath: string }> {
  const outputTemplate = `/tmp/pinme-${pinId}.%(ext)s`;

  await runYtDlp([
    "--no-playlist",
    "--no-warnings",
    "--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/bestvideo+bestaudio/best",
    "--merge-output-format", "mp4",
    "-o", outputTemplate,
    url,
  ]);

  // Find the actual output file (yt-dlp resolves %(ext)s at download time)
  const preferredPath = `/tmp/pinme-${pinId}.mp4`;
  if (fs.existsSync(preferredPath)) {
    const stat = fs.statSync(preferredPath);
    if (stat.size < 10_000) {
      fs.unlinkSync(preferredPath);
      throw new Error("NO_VIDEO");
    }
    return { filePath: preferredPath };
  }

  // Fallback: glob for any file with this pinId prefix
  const dir = "/tmp";
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f.startsWith(`pinme-${pinId}.`) && !f.endsWith(".part") && !f.endsWith(".ytdl")) {
      const fp = path.join(dir, f);
      const stat = fs.statSync(fp);
      if (stat.size >= 10_000) return { filePath: fp };
      fs.unlinkSync(fp);
      throw new Error("NO_VIDEO");
    }
  }

  throw new Error("NO_FILE: output file not found after yt-dlp succeeded");
}

function buildFilename(title: string | null, filePath: string): string {
  const ext = path.extname(filePath).slice(1) || "mp4";
  // Reject obviously-wrong titles (blank, just the ext, very short generics)
  const genericTitles = new Set(["mp4", "mkv", "webm", "video", "watch", "pin", ""]);
  const cleaned = (title || "")
    .replace(/[^\w\s\-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  if (!cleaned || genericTitles.has(cleaned) || cleaned.length < 3) {
    return `pinme-video-${Date.now()}.${ext}`;
  }

  return `${cleaned.slice(0, 60)}.${ext}`;
}

// POST /api/get-pin
// Step 1: Resolve metadata, Step 2: Download via yt-dlp, Step 3: Return stream token
router.post("/get-pin", async (req, res) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== "string" || !url.trim()) {
    res.status(400).json({ error: "This doesn't look like a Pinterest link." });
    return;
  }

  const trimmed = url.trim();

  if (!isPinterestUrl(trimmed)) {
    res.status(400).json({ error: "This doesn't look like a Pinterest link." });
    return;
  }

  let meta: PinMeta;
  try {
    meta = await getPinMeta(trimmed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log?.error({ err: msg, url: trimmed }, "get-pin meta failed");
    if (msg === "NO_VIDEO") {
      res.status(400).json({ error: "This pin doesn't contain a video." });
    } else if (msg === "UNAVAILABLE") {
      res.status(404).json({ error: "Couldn't fetch this video. It may be unavailable or private." });
    } else if (msg === "TIMEOUT") {
      res.status(504).json({ error: "Request timed out. Please try again." });
    } else {
      res.status(500).json({ error: "Couldn't fetch this video. It may be unavailable or private." });
    }
    return;
  }

  let filePath: string;
  try {
    ({ filePath } = await downloadVideo(trimmed, meta.id));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log?.error({ err: msg, url: trimmed, id: meta.id }, "get-pin download failed");
    if (msg === "NO_VIDEO") {
      res.status(400).json({ error: "This pin doesn't contain a video." });
    } else if (msg === "TIMEOUT") {
      res.status(504).json({ error: "Download timed out. Please try again." });
    } else {
      res.status(500).json({ error: "Couldn't fetch this video. It may be unavailable or private." });
    }
    return;
  }

  const filename = buildFilename(meta.title, filePath);
  const token = randomBytes(16).toString("hex");

  pendingDownloads.set(token, {
    filePath,
    filename,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  res.json({
    downloadUrl: `/api/stream/${token}`,
    filename,
    title: meta.title || null,
  });
});

// GET /api/stream/:token
// Streams the pre-downloaded video file to the browser as a native file download
router.get("/stream/:token", (req, res) => {
  const { token } = req.params;

  const entry = pendingDownloads.get(token);
  if (!entry) {
    res.status(404).json({ error: "Download link expired. Please try again." });
    return;
  }

  const { filePath, filename } = entry;

  if (!fs.existsSync(filePath)) {
    pendingDownloads.delete(token);
    res.status(404).json({ error: "File not found. Please try again." });
    return;
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    pendingDownloads.delete(token);
    res.status(500).json({ error: "Failed to read video file." });
    return;
  }

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Cache-Control", "no-store");

  const fileStream = fs.createReadStream(filePath);

  const cleanup = () => {
    pendingDownloads.delete(token);
    try { fs.unlinkSync(filePath); } catch { /* best-effort */ }
  };

  fileStream.on("end", cleanup);
  fileStream.on("error", (err) => {
    req.log?.error({ err }, "stream read error");
    cleanup();
    if (!res.headersSent) res.status(500).end();
  });

  res.on("close", () => {
    // Client disconnected early (e.g. download cancelled) — clean up anyway
    fileStream.destroy();
    cleanup();
  });

  fileStream.pipe(res);
});

export default router;
