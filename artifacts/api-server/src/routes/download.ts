import { Router } from "express";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath, URL } from "url";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import archiver from "archiver";

const router = Router();

const DOWNLOAD_TTL_MS = 30 * 60 * 1000;

// ============================================================
// SPEED TUNING
// ============================================================

const YTDLP_TIMEOUT_MS = 90_000;

// More parallel fragments for video downloads.
// Actual speed still depends on Pinterest/Render/network.
const YTDLP_CONCURRENT_FRAGMENTS = 8;

// Larger file-stream buffer for server -> phone delivery.
const FILE_STREAM_HIGH_WATER_MARK = 2 * 1024 * 1024;

// ============================================================
// PATHS
// ============================================================

const bundledYtDlpPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../vendor/yt-dlp",
);

// ============================================================
// DOWNLOAD TOKEN
// ============================================================

type DownloadTokenPayload = {
  url: string;
  pinId: string;
  filename: string;
  expiresAt: number;
  mediaType: "video" | "image" | "carousel";
};

// token → temporary prepared file
const pendingDownloads = new Map<
  string,
  {
    filePath: string;
    filename: string;
    expiresAt: number;
  }
>();

// ============================================================
// CLEANUP
// ============================================================

setInterval(() => {
  const now = Date.now();

  for (const [token, entry] of pendingDownloads.entries()) {
    if (entry.expiresAt < now) {
      try {
        if (fs.existsSync(entry.filePath)) {
          fs.unlinkSync(entry.filePath);
        }
      } catch {
        // best-effort cleanup
      }

      pendingDownloads.delete(token);
    }
  }
}, 2 * 60 * 1000);

// ============================================================
// TOKEN HELPERS
// ============================================================

function getTokenSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET_UNAVAILABLE");
  }

  return secret;
}

function createDownloadToken(
  payload: DownloadTokenPayload,
): string {
  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
  ).toString("base64url");

  const signature = createHmac(
    "sha256",
    getTokenSecret(),
  )
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function parseDownloadToken(
  token: string,
): DownloadTokenPayload | null {
  const [encodedPayload, encodedSignature] =
    token.split(".");

  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  try {
    const expectedSignature = createHmac(
      "sha256",
      getTokenSecret(),
    )
      .update(encodedPayload)
      .digest();

    const providedSignature = Buffer.from(
      encodedSignature,
      "base64url",
    );

    if (
      providedSignature.length !==
        expectedSignature.length ||
      !timingSafeEqual(
        providedSignature,
        expectedSignature,
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(
        encodedPayload,
        "base64url",
      ).toString("utf8"),
    ) as Partial<DownloadTokenPayload>;

    if (
      typeof payload.url !== "string" ||
      typeof payload.pinId !== "string" ||
      typeof payload.filename !== "string" ||
      typeof payload.expiresAt !== "number" ||
      !["video", "image", "carousel"].includes(
        payload.mediaType as string,
      )
    ) {
      return null;
    }

    return payload as DownloadTokenPayload;
  } catch {
    return null;
  }
}

// ============================================================
// PINTEREST URL CHECK
// ============================================================

function isPinterestUrl(
  rawUrl: string,
): boolean {
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

// ============================================================
// YT-DLP
// ============================================================

function getYtDlpCommand(): string {
  if (process.env.YT_DLP_PATH) {
    return process.env.YT_DLP_PATH;
  }

  if (fs.existsSync(bundledYtDlpPath)) {
    return bundledYtDlpPath;
  }

  return "yt-dlp";
}

function runYtDlp(
  args: string[],
  onStderrLine?: (
    line: string,
  ) => void,
): Promise<{
  stdout: string;
  stderr: string;
}> {
  return new Promise(
    (resolve, reject) => {
      const proc = spawn(
        getYtDlpCommand(),
        args,
        {
          stdio: [
            "ignore",
            "pipe",
            "pipe",
          ],
        },
      );

      const timeout = setTimeout(() => {
        proc.kill("SIGKILL");

        reject(
          new Error("TIMEOUT"),
        );
      }, YTDLP_TIMEOUT_MS);

      let stdout = "";
      let stderr = "";
      let stderrBuf = "";

      proc.stdout.on(
        "data",
        (d: Buffer) => {
          stdout += d.toString();
        },
      );

      proc.stderr.on(
        "data",
        (d: Buffer) => {
          const chunk = d.toString();

          stderr += chunk;

          if (onStderrLine) {
            stderrBuf += chunk;

            const lines =
              stderrBuf.split("\n");

            stderrBuf =
              lines.pop() ?? "";

            for (const line of lines) {
              onStderrLine(line);
            }
          }
        },
      );

      proc.on(
        "close",
        (code: number | null) => {
          clearTimeout(timeout);

          if (code !== 0) {
            reject(
              Object.assign(
                new Error(
                  `yt-dlp exit ${code}`,
                ),
                {
                  code,
                  stdout,
                  stderr,
                },
              ),
            );
          } else {
            resolve({
              stdout,
              stderr,
            });
          }
        },
      );

      proc.on(
        "error",
        (err) => {
          clearTimeout(timeout);
          reject(err);
        },
      );
    },
  );
}

// ============================================================
// PIN META
// ============================================================

interface PinMeta {
  id: string;
  title: string | null;
  hasVideo: boolean;
  isImage?: boolean;
  isCarousel?: boolean;
  imageUrl?: string | null;
}

async function getPinMeta(
  url: string,
): Promise<PinMeta> {
  let stdout: string;

  try {
    ({ stdout } =
      await runYtDlp([
        "--dump-json",
        "--no-playlist",
        "--no-warnings",
        url,
      ]));
  } catch (err) {
    const e = err as {
      stderr?: string;
    };

    const errLower =
      (e.stderr || "").toLowerCase();

    if (
      errLower.includes("unsupported url") ||
      errLower.includes("no video") ||
      errLower.includes("not a video")
    ) {
      return {
        id: randomBytes(4).toString("hex"),
        title: null,
        hasVideo: false,
        isImage: true,
      };
    }

    if (
      errLower.includes("private") ||
      errLower.includes("unavailable") ||
      errLower.includes("not available") ||
      errLower.includes("not exist") ||
      errLower.includes("login required")
    ) {
      throw new Error("UNAVAILABLE");
    }

    throw err;
  }

  const lines =
    stdout.trim().split("\n");

  let info:
    Record<string, unknown> | null = null;

  for (
    let i = lines.length - 1;
    i >= 0;
    i--
  ) {
    try {
      const parsed =
        JSON.parse(
          lines[i].trim(),
        );

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        info = parsed;
        break;
      }
    } catch {
      // skip malformed lines
    }
  }

  if (!info) {
    throw new Error("PARSE_ERROR");
  }

  const formats =
    (info.formats as Array<
      Record<string, unknown>
    >) || [];

  const hasVideoFormats =
    formats.some(
      (f) =>
        f.vcodec &&
        f.vcodec !== "none" &&
        f.vcodec !== null,
    );

  const ext =
    (
      info.ext as string ||
      ""
    ).toLowerCase();

  const isImage = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
  ].includes(ext);

  const entries =
    info.entries as
      | Array<Record<string, unknown>>
      | undefined;

  // Carousel
  if (
    Array.isArray(entries) &&
    entries.length > 1
  ) {
    return {
      id:
        (info.id as string) ||
        randomBytes(4).toString("hex"),
      title:
        (info.title as string) ||
        null,
      hasVideo: false,
      isCarousel: true,
    };
  }

  // Single image
  if (!hasVideoFormats || isImage) {
    return {
      id:
        (info.id as string) ||
        randomBytes(4).toString("hex"),
      title:
        (info.title as string) ||
        null,
      hasVideo: false,
      isImage: true,
      imageUrl:
        (info.url as string) ||
        null,
    };
  }

  // Video
  return {
    id:
      (info.id as string) ||
      randomBytes(4).toString("hex"),
    title:
      (info.title as string) ||
      null,
    hasVideo: true,
  };
}

// ============================================================
// GALLERY-DL
// ============================================================

function getGalleryDlCommand(): string {
  if (process.env.GALLERY_DL_PATH) {
    return process.env.GALLERY_DL_PATH;
  }

  return "gallery-dl";
}

function runGalleryDl(
  args: string[],
  onStderrLine?: (
    line: string,
  ) => void,
): Promise<{
  stdout: string;
  stderr: string;
}> {
  return new Promise(
    (resolve, reject) => {
      const proc = spawn(
        getGalleryDlCommand(),
        args,
        {
          stdio: [
            "ignore",
            "pipe",
            "pipe",
          ],
        },
      );

      const timeout =
        setTimeout(() => {
          proc.kill("SIGKILL");

          reject(
            new Error("TIMEOUT"),
          );
        }, YTDLP_TIMEOUT_MS);

      let stdout = "";
      let stderr = "";
      let stderrBuf = "";

      proc.stdout.on(
        "data",
        (d: Buffer) => {
          stdout += d.toString();
        },
      );

      proc.stderr.on(
        "data",
        (d: Buffer) => {
          const chunk = d.toString();

          stderr += chunk;

          if (onStderrLine) {
            stderrBuf += chunk;

            const lines =
              stderrBuf.split("\n");

            stderrBuf =
              lines.pop() ?? "";

            for (const line of lines) {
              onStderrLine(line);
            }
          }
        },
      );

      proc.on(
        "close",
        (code: number | null) => {
          clearTimeout(timeout);

          if (code !== 0) {
            reject(
              Object.assign(
                new Error(
                  `gallery-dl exit ${code}`,
                ),
                {
                  code,
                  stdout,
                  stderr,
                },
              ),
            );
          } else {
            resolve({
              stdout,
              stderr,
            });
          }
        },
      );

      proc.on(
        "error",
        (err) => {
          clearTimeout(timeout);
          reject(err);
        },
      );
    },
  );
}

// ============================================================
// IMAGE HELPERS
// ============================================================

function findAllImages(
  dir: string,
): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries =
    fs.readdirSync(
      dir,
      {
        withFileTypes: true,
      },
    );

  for (const entry of entries) {
    const fullPath =
      path.join(
        dir,
        entry.name,
      );

    if (entry.isFile()) {
      if (
        /\.(jpg|jpeg|png|webp|gif)$/i.test(
          entry.name,
        )
      ) {
        results.push(fullPath);
      }
    } else if (
      entry.isDirectory()
    ) {
      results.push(
        ...findAllImages(
          fullPath,
        ),
      );
    }
  }

  return results;
}

// ============================================================
// DIRECT SINGLE IMAGE DOWNLOAD
// ============================================================
//
// IMPORTANT:
// For a normal single image, do NOT:
// gallery-dl -> sharp -> PNG
//
// Instead:
// Pinterest metadata -> direct image URL -> file
//
// This avoids unnecessary processing and preserves
// the original image format/quality.
//

async function downloadDirectImage(
  imageUrl: string,
  outputDir: string,
  pinId: string,
): Promise<{
  filePath: string;
}> {
  const response =
    await fetch(
      imageUrl,
      {
        redirect: "follow",
      },
    );

  if (!response.ok) {
    throw new Error(
      `IMAGE_FETCH_${response.status}`,
    );
  }

  const contentType =
    (
      response.headers.get(
        "content-type",
      ) || ""
    ).toLowerCase();

  let ext = "jpg";

  if (
    contentType.includes(
      "image/png",
    )
  ) {
    ext = "png";
  } else if (
    contentType.includes(
      "image/webp",
    )
  ) {
    ext = "webp";
  } else if (
    contentType.includes(
      "image/gif",
    )
  ) {
    ext = "gif";
  } else if (
    contentType.includes(
      "image/jpeg",
    )
  ) {
    ext = "jpg";
  } else {
    const urlExt =
      imageUrl.match(
        /\.(jpg|jpeg|png|webp|gif)(?:[?#]|$)/i,
      );

    if (urlExt) {
      ext =
        urlExt[1].toLowerCase();

      if (ext === "jpeg") {
        ext = "jpg";
      }
    }
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer(),
    );

  if (buffer.length < 100) {
    throw new Error(
      "EMPTY_IMAGE",
    );
  }

  const filePath =
    path.join(
      outputDir,
      `${pinId}.${ext}`,
    );

  fs.writeFileSync(
    filePath,
    buffer,
  );

  return {
    filePath,
  };
}

// ============================================================
// IMAGE / CAROUSEL DOWNLOAD
// ============================================================

async function downloadImageOrCarousel(
  url: string,
  pinId: string,
  onStage?: (
    label: string,
  ) => void,
  imageUrl?: string | null,
): Promise<{
  filePath: string;
  mediaType: "image" | "carousel";
  imageCount: number;
}> {
  const outputDir =
    `/tmp/pinme-img-${pinId}`;

  fs.mkdirSync(
    outputDir,
    {
      recursive: true,
    },
  );

  // ========================================================
  // FAST PATH: SINGLE IMAGE
  // ========================================================

  if (imageUrl) {
    try {
      onStage?.(
        "Downloading image...",
      );

      console.log(
        "=== FAST DIRECT IMAGE FETCH ===",
      );

      const direct =
        await downloadDirectImage(
          imageUrl,
          outputDir,
          pinId,
        );

      console.log(
        "Direct image download complete:",
        direct.filePath,
      );

      return {
        filePath:
          direct.filePath,
        mediaType: "image",
        imageCount: 1,
      };
    } catch (err) {
      console.log(
        "Direct image fetch failed, falling back to gallery-dl:",
        err,
      );
    }
  }

  // ========================================================
  // FALLBACK / CAROUSEL PATH: GALLERY-DL
  // ========================================================

  onStage?.(
    "Downloading image...",
  );

  try {
    console.log(
      "=== gallery-dl image/carousel ===",
    );

    await runGalleryDl([
      "-d",
      outputDir,
      "--no-part",
      url,
    ]);

    const images =
      findAllImages(
        outputDir,
      );

    console.log(
      `gallery-dl found ${images.length} image(s)`,
    );

    // ======================================================
    // CAROUSEL
    // ======================================================

    if (images.length > 1) {
      onStage?.(
        "Packaging carousel...",
      );

      const zipPath =
        path.join(
          outputDir,
          `pinme-carousel-${pinId}.zip`,
        );

      await new Promise<void>(
        (
          resolve,
          reject,
        ) => {
          const output =
            fs.createWriteStream(
              zipPath,
            );

          const archive =
            archiver("zip", {
              // Images are already compressed.
              // Store them instead of spending CPU
              // recompressing them.
              store: true,
            });

          output.on(
            "close",
            () => resolve(),
          );

          output.on(
            "error",
            (err) => reject(err),
          );

          archive.on(
            "error",
            (err) => reject(err),
          );

          archive.pipe(
            output,
          );

          images.forEach(
            (
              imgPath,
              index,
            ) => {
              const ext =
                path.extname(
                  imgPath,
                );

              archive.file(
                imgPath,
                {
                  name:
                    `image-${String(
                      index + 1,
                    ).padStart(
                      2,
                      "0",
                    )}${ext}`,
                },
              );
            },
          );

          archive.finalize();
        },
      );

      return {
        filePath: zipPath,
        mediaType: "carousel",
        imageCount:
          images.length,
      };
    }

    // ======================================================
    // SINGLE IMAGE FROM GALLERY-DL FALLBACK
    // ======================================================

    if (images.length === 1) {
      return {
        filePath: images[0],
        mediaType: "image",
        imageCount: 1,
      };
    }
  } catch (err) {
    console.log(
      "gallery-dl image/carousel failed:",
      err,
    );
  }

  throw new Error(
    "NO_FILE: no image found for this pin",
  );
}

// ============================================================
// VIDEO DOWNLOAD
// ============================================================
//
// BEST AVAILABLE native quality.
// No resolution cap.
// No artificial upscaling.
// No user quality selector.
//

async function downloadVideo(
  url: string,
  pinId: string,
  onStage?: (
    label: string,
  ) => void,
): Promise<{
  filePath: string;
}> {
  const outputTemplate =
    `/tmp/pinme-${pinId}.%(ext)s`;

  let mergeSignalled =
    false;

  console.log(
    "=== Video download ===",
  );

  console.log(
    "Quality mode: BEST AVAILABLE",
  );

  console.log(
    "Speed mode: OPTIMIZED",
  );

  await runYtDlp(
    [
      "--no-playlist",
      "--no-warnings",

      // Parallel video fragments.
      "--concurrent-fragments",
      String(
        YTDLP_CONCURRENT_FRAGMENTS,
      ),

      // Keep retries limited so failed requests
      // don't hang for too long.
      "--retries",
      "2",

      "--fragment-retries",
      "2",

      "--socket-timeout",
      "15",

      // Best available native quality.
      "--format",
      "bestvideo+bestaudio/best",

      // MP4 output.
      "--merge-output-format",
      "mp4",

      "-o",
      outputTemplate,

      url,
    ],
    (line) => {
      if (
        !mergeSignalled &&
        line.includes("[Merger]")
      ) {
        mergeSignalled =
          true;

        onStage?.(
          "Processing video...",
        );
      }
    },
  );

  // Preferred MP4.
  const preferredPath =
    `/tmp/pinme-${pinId}.mp4`;

  if (
    fs.existsSync(
      preferredPath,
    )
  ) {
    const stat =
      fs.statSync(
        preferredPath,
      );

    if (
      stat.size < 10_000
    ) {
      fs.unlinkSync(
        preferredPath,
      );

      throw new Error(
        "NO_VIDEO",
      );
    }

    return {
      filePath:
        preferredPath,
    };
  }

  // Fallback: find actual output.
  const files =
    fs.readdirSync(
      "/tmp",
    );

  for (const f of files) {
    if (
      f.startsWith(
        `pinme-${pinId}.`,
      ) &&
      !f.endsWith(".part") &&
      !f.endsWith(".ytdl")
    ) {
      const fp =
        path.join(
          "/tmp",
          f,
        );

      const stat =
        fs.statSync(fp);

      if (
        stat.size >= 10_000
      ) {
        return {
          filePath: fp,
        };
      }

      try {
        fs.unlinkSync(fp);
      } catch {
        // best-effort
      }

      throw new Error(
        "NO_VIDEO",
      );
    }
  }

  throw new Error(
    "NO_FILE: output file not found after yt-dlp succeeded",
  );
}

// ============================================================
// FILENAME
// ============================================================

function buildFilename(
  title: string | null,
  filePath: string,
): string {
  const ext =
    path.extname(
      filePath,
    ).slice(1) ||
    "mp4";

  if (
    ext.toLowerCase() === "zip"
  ) {
    return `pinme-carousel-${Date.now()}.zip`;
  }

  const genericTitles =
    new Set([
      "mp4",
      "mkv",
      "webm",
      "video",
      "watch",
      "pin",
      "",
    ]);

  const cleaned =
    (title || "")
      .replace(
        /[^\w\s\-]/g,
        "",
      )
      .replace(
        /\s+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      )
      .toLowerCase();

  if (
    !cleaned ||
    genericTitles.has(
      cleaned,
    ) ||
    cleaned.length < 3
  ) {
    return `pinme-download-${Date.now()}.${ext}`;
  }

  return `${cleaned.slice(
    0,
    60,
  )}.${ext}`;
}

// ============================================================
// MIME
// ============================================================

function getMimeType(
  filename: string,
): string {
  const ext =
    path.extname(
      filename,
    ).toLowerCase();

  const types: Record<
    string,
    string
  > = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".zip": "application/zip",
  };

  return (
    types[ext] ||
    "application/octet-stream"
  );
}

// ============================================================
// USER ERRORS
// ============================================================

function toUserError(
  msg: string,
): {
  status: number;
  error: string;
} {
  if (
    msg === "NO_VIDEO"
  ) {
    return {
      status: 400,
      error:
        "This pin doesn't contain a video.",
    };
  }

  if (
    msg === "UNAVAILABLE"
  ) {
    return {
      status: 404,
      error:
        "Couldn't fetch this video. It may be unavailable or private.",
    };
  }

  if (
    msg === "TIMEOUT"
  ) {
    return {
      status: 504,
      error:
        "Request timed out. Please try again.",
    };
  }

  return {
    status: 500,
    error:
      "Couldn't fetch this video. It may be unavailable or private.",
  };
}

// ============================================================
// POST /api/get-pin
// ============================================================

router.post(
  "/get-pin",
  async (req, res) => {
    const {
      url,
    } =
      req.body as {
        url?: string;
      };

    if (
      !url ||
      typeof url !== "string" ||
      !url.trim()
    ) {
      res.status(400).json({
        error:
          "This doesn't look like a Pinterest link.",
      });

      return;
    }

    const trimmed =
      url.trim();

    if (
      !isPinterestUrl(
        trimmed,
      )
    ) {
      res.status(400).json({
        error:
          "This doesn't look like a Pinterest link.",
      });

      return;
    }

    // ========================================================
    // SSE
    // ========================================================

    res.setHeader(
      "Content-Type",
      "text/event-stream",
    );

    res.setHeader(
      "Cache-Control",
      "no-cache",
    );

    res.setHeader(
      "Connection",
      "keep-alive",
    );

    res.flushHeaders();

    const send = (
      data: object,
    ) => {
      if (
        !res.writableEnded
      ) {
        res.write(
          `data: ${JSON.stringify(
            data,
          )}\n\n`,
        );
      }
    };

    try {
      // ======================================================
      // STEP 1
      // ======================================================

      send({
        type: "stage",
        label:
          "Fetching info...",
      });

      const meta =
        await getPinMeta(
          trimmed,
        );

      let filePath: string;

      let mediaType:
        | "video"
        | "image"
        | "carousel";

      let imageCount:
        | number
        | undefined;

      // ======================================================
      // IMAGE / CAROUSEL
      // ======================================================

      if (
        meta.isImage ||
        meta.isCarousel
      ) {
        const result =
          await downloadImageOrCarousel(
            trimmed,
            meta.id,
            (label) =>
              send({
                type: "stage",
                label,
              }),
            meta.imageUrl,
          );

        filePath =
          result.filePath;

        mediaType =
          result.mediaType;

        imageCount =
          result.imageCount;
      }

      // ======================================================
      // VIDEO
      // ======================================================

      else {
        send({
          type: "stage",
          label:
            "Downloading video...",
        });

        const vid =
          await downloadVideo(
            trimmed,
            meta.id,
            (label) =>
              send({
                type: "stage",
                label,
              }),
          );

        filePath =
          vid.filePath;

        mediaType =
          "video";
      }

      // ======================================================
      // PREPARE TOKEN
      // ======================================================

      send({
        type: "stage",
        label:
          "Preparing download...",
      });

      const filename =
        buildFilename(
          meta.title,
          filePath,
        );

      const expiresAt =
        Date.now() +
        DOWNLOAD_TTL_MS;

      const token =
        createDownloadToken({
          url: trimmed,
          pinId: meta.id,
          filename,
          expiresAt,
          mediaType,
        });

      pendingDownloads.set(
        token,
        {
          filePath,
          filename,
          expiresAt,
        },
      );

      // ======================================================
      // READY
      // ======================================================

      send({
        type: "ready",
        token,
        filename,
        title:
          meta.title ??
          null,
        mediaType,
        imageCount,
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : String(err);

      req.log?.error(
        {
          err: msg,
          url: trimmed,
        },
        "get-pin failed",
      );

      const { error } =
        toUserError(msg);

      send({
        type: "error",
        message: error,
      });
    } finally {
      res.end();
    }
  },
);

// ============================================================
// GET /api/stream/:token
// ============================================================

router.get(
  "/stream/:token",
  async (
    req,
    res,
  ): Promise<void> => {
    const { token } =
      req.params;

    const payload =
      parseDownloadToken(
        token,
      );

    if (
      !payload ||
      payload.expiresAt <=
        Date.now()
    ) {
      res.status(404).json({
        error:
          "Download link expired. Please try again.",
      });

      return;
    }

    const entry =
      pendingDownloads.get(
        token,
      );

    let filePath: string;

    let filename =
      payload.filename;

    // ========================================================
    // USE PREPARED FILE
    // ========================================================

    if (
      entry &&
      fs.existsSync(
        entry.filePath,
      )
    ) {
      filePath =
        entry.filePath;

      filename =
        entry.filename;
    }

    // ========================================================
    // FALLBACK FRESH DOWNLOAD
    // ========================================================

    else {
      try {
        req.log?.warn(
          "Prepared download was unavailable; fetching a fresh copy",
        );

        const retryPinId =
          `retry-${randomBytes(
            8,
          ).toString("hex")}`;

        if (
          payload.mediaType ===
          "carousel"
        ) {
          const carousel =
            await downloadImageOrCarousel(
              payload.url,
              retryPinId,
            );

          filePath =
            carousel.filePath;

          filename =
            buildFilename(
              null,
              filePath,
            );
        } else if (
          payload.mediaType ===
          "image"
        ) {
          const image =
            await downloadImageOrCarousel(
              payload.url,
              retryPinId,
            );

          filePath =
            image.filePath;

          filename =
            buildFilename(
              null,
              filePath,
            );
        } else {
          const fresh =
            await downloadVideo(
              payload.url,
              retryPinId,
            );

          filePath =
            fresh.filePath;

          filename =
            buildFilename(
              null,
              filePath,
            );
        }

        pendingDownloads.set(
          token,
          {
            filePath,
            filename,
            expiresAt:
              payload.expiresAt,
          },
        );
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : String(err);

        req.log?.error(
          {
            err: msg,
          },
          "Fresh download retry failed",
        );

        const {
          status,
          error,
        } =
          toUserError(msg);

        res
          .status(status)
          .json({
            error,
          });

        return;
      }
    }

    // ========================================================
    // FILE CHECK
    // ========================================================

    if (
      !fs.existsSync(
        filePath,
      )
    ) {
      pendingDownloads.delete(
        token,
      );

      res.status(404).json({
        error:
          "File not found. Please try again.",
      });

      return;
    }

    let stat: fs.Stats;

    try {
      stat =
        fs.statSync(
          filePath,
        );
    } catch {
      pendingDownloads.delete(
        token,
      );

      res.status(500).json({
        error:
          "Failed to read download file.",
      });

      return;
    }

    // ========================================================
    // RESPONSE HEADERS
    // ========================================================

    res.setHeader(
      "Content-Type",
      getMimeType(
        filename,
      ),
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );

    res.setHeader(
      "Content-Length",
      stat.size,
    );

    res.setHeader(
      "Cache-Control",
      "no-store",
    );

    // ========================================================
    // FAST FILE STREAM
    // ========================================================

    const fileStream =
      fs.createReadStream(
        filePath,
        {
          highWaterMark:
            FILE_STREAM_HIGH_WATER_MARK,
        },
      );

    const removeFailedDownload =
      () => {
        pendingDownloads.delete(
          token,
        );

        try {
          if (
            fs.existsSync(
              filePath,
            )
          ) {
            fs.unlinkSync(
              filePath,
            );
          }
        } catch {
          // best-effort
        }
      };

    fileStream.on(
      "error",
      (err) => {
        req.log?.error(
          {
            err,
          },
          "stream read error",
        );

        removeFailedDownload();

        if (
          !res.headersSent
        ) {
          res
            .status(500)
            .end();
        }
      },
    );

    // If client disconnects during download,
    // stop reading the temporary file.
    res.on(
      "close",
      () => {
        if (
          !res.writableFinished
        ) {
          fileStream.destroy();
        }
      },
    );

    // Once response finishes successfully,
    // delete the temporary file.
    res.on(
      "finish",
      () => {
        pendingDownloads.delete(
          token,
        );

        try {
          if (
            fs.existsSync(
              filePath,
            )
          ) {
            fs.unlinkSync(
              filePath,
            );
          }
        } catch {
          // best-effort
        }
      },
    );

    fileStream.pipe(res);
  },
);

export default router;