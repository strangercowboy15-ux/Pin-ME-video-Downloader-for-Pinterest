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

// Spawn yt-dlp, optionally calling onStderrLine for each stderr line (for stage detection).
function runYtDlp(
  args: string[],
  onStderrLine?: (line: string) => void,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error("TIMEOUT"));
    }, 120_000);

    const proc = spawn("yt-dlp", args);
    let stdout = "";
    let stderr = "";
    let stderrBuf = ""; // line buffer for callback

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => {
      const chunk = d.toString();
      stderr += chunk;
      if (onStderrLine) {
        stderrBuf += chunk;
        const lines = stderrBuf.split("\n");
        stderrBuf = lines.pop() ?? "";
        for (const line of lines) onStderrLine(line);
      }
    });
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

  const lines = stdout.trim().split("\n");
  let info: Record<string, unknown> | null = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i].trim());
      if (parsed && typeof parsed === "object") { info = parsed; break; }
    } catch { /* skip */ }
  }
  if (!info) throw new Error("PARSE_ERROR");

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

// onStage is called whenever a meaningful stage transition is detected in stderr.
async function downloadVideo(
  url: string,
  pinId: string,
  onStage?: (label: string) => void,
): Promise<{ filePath: string }> {
  const outputTemplate = `/tmp/pinme-${pinId}.%(ext)s`;
  let mergeSignalled = false;

  await runYtDlp(
    [
      "--no-playlist",
      "--no-warnings",
      "--concurrent-fragments", "4",   // download HLS segments in parallel
      "--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "-o", outputTemplate,
      url,
    ],
    (line) => {
      // "[Merger] Merging formats into ..." signals the ffmpeg merge step
      if (!mergeSignalled && line.includes("[Merger]")) {
        mergeSignalled = true;
        onStage?.("Processing video...");
      }
    },
  );

  const preferredPath = `/tmp/pinme-${pinId}.mp4`;
  if (fs.existsSync(preferredPath)) {
    const stat = fs.statSync(preferredPath);
    if (stat.size < 10_000) {
      fs.unlinkSync(preferredPath);
      throw new Error("NO_VIDEO");
    }
    return { filePath: preferredPath };
  }

  // Fallback: find any file with this pinId prefix
  const files = fs.readdirSync("/tmp");
  for (const f of files) {
    if (f.startsWith(`pinme-${pinId}.`) && !f.endsWith(".part") && !f.endsWith(".ytdl")) {
      const fp = path.join("/tmp", f);
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

function toUserError(msg: string): { status: number; error: string } {
  if (msg === "NO_VIDEO")    return { status: 400, error: "This pin doesn't contain a video." };
  if (msg === "UNAVAILABLE") return { status: 404, error: "Couldn't fetch this video. It may be unavailable or private." };
  if (msg === "TIMEOUT")     return { status: 504, error: "Request timed out. Please try again." };
  return { status: 500, error: "Couldn't fetch this video. It may be unavailable or private." };
}

// POST /api/get-pin
// Returns a Server-Sent Events stream so the frontend can show live progress stages.
// Events: { type: "stage", label: string }
//         { type: "ready", token: string, filename: string, title: string|null }
//         { type: "error", message: string }
router.post("/get-pin", async (req, res) => {
  const { url } = req.body as { url?: string };

  // Validate before opening the SSE stream so we can still return a proper JSON 400.
  if (!url || typeof url !== "string" || !url.trim()) {
    res.status(400).json({ error: "This doesn't look like a Pinterest link." });
    return;
  }
  const trimmed = url.trim();
  if (!isPinterestUrl(trimmed)) {
    res.status(400).json({ error: "This doesn't look like a Pinterest link." });
    return;
  }

  // Open SSE stream
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: object) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Stage 1 — metadata
    send({ type: "stage", label: "Fetching video info..." });
    const meta = await getPinMeta(trimmed);

    // Stage 2 — download (stage 3 "Processing video..." fires from the stderr callback inside downloadVideo)
    send({ type: "stage", label: "Downloading video..." });
    const { filePath } = await downloadVideo(trimmed, meta.id, (label) => send({ type: "stage", label }));

    // Stage 4 — build token
    send({ type: "stage", label: "Preparing download..." });
    const filename = buildFilename(meta.title, filePath);
    const token = randomBytes(16).toString("hex");
    pendingDownloads.set(token, {
      filePath,
      filename,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    send({ type: "ready", token, filename, title: meta.title ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log?.error({ err: msg, url: trimmed }, "get-pin failed");
    const { error } = toUserError(msg);
    send({ type: "error", message: error });
  } finally {
    res.end();
  }
});

// GET /api/stream/:token — unchanged
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
  res.on("close", () => { fileStream.destroy(); cleanup(); });

  fileStream.pipe(res);
});

export default router;
