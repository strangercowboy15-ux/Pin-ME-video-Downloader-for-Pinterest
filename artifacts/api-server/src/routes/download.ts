import { Router } from "express";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath, URL } from "url";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import archiver from "archiver";
import sharp from "sharp";

const router = Router();

const DOWNLOAD_TTL_MS = 30 * 60 * 1000;

const bundledYtDlpPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../vendor/yt-dlp",
);

type DownloadTokenPayload = {
  url: string;
  pinId: string;
  filename: string;
  expiresAt: number;
  mediaType: "video" | "image" | "carousel";
};

// In-memory store: token → { filePath, filename, expiresAt }
const pendingDownloads = new Map<
  string,
  {
    filePath: string;
    filename: string;
    expiresAt: number;
  }
>();

// Clean up expired entries every 2 minutes
setInterval(() => {
  const now = Date.now();

  for (const [token, entry] of pendingDownloads.entries()) {
    if (entry.expiresAt < now) {
      try {
        if (fs.existsSync(entry.filePath)) {
          fs.unlinkSync(entry.filePath);
        }
      } catch {
        // best-effort
      }

      pendingDownloads.delete(token);
    }
  }
}, 2 * 60 * 1000);

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

function isPinterestUrl(
  rawUrl: string,
): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host =
      parsed.hostname.toLowerCase();

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

function getYtDlpCommand(): string {
  if (process.env.YT_DLP_PATH) {
    return process.env.YT_DLP_PATH;
  }

  if (fs.existsSync(bundledYtDlpPath)) {
    return bundledYtDlpPath;
  }

  return "yt-dlp";
}

// Spawn yt-dlp, optionally calling onStderrLine
// for each stderr line.
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
      );

      const timeout =
        setTimeout(() => {
          proc.kill("SIGKILL");

          reject(
            new Error("TIMEOUT"),
          );
        }, 120_000);

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
          const chunk =
            d.toString();

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
      (e.stderr || "")
        .toLowerCase();

    if (
      errLower.includes(
        "unsupported url",
      ) ||
      errLower.includes(
        "no video",
      ) ||
      errLower.includes(
        "not a video",
      )
    ) {
      return {
        id: randomBytes(
          4,
        ).toString("hex"),
        title: null,
        hasVideo: false,
        isImage: true,
      };
    }

    if (
      errLower.includes("private") ||
      errLower.includes(
        "unavailable",
      ) ||
      errLower.includes(
        "not available",
      ) ||
      errLower.includes(
        "not exist",
      ) ||
      errLower.includes(
        "login required",
      )
    ) {
      throw new Error(
        "UNAVAILABLE",
      );
    }

    throw err;
  }

  const lines =
    stdout.trim().split("\n");

  let info:
    Record<
      string,
      unknown
    > | null = null;

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
      // skip
    }
  }

  if (!info) {
    throw new Error(
      "PARSE_ERROR",
    );
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

  console.log(
    "=== getPinMeta DEBUG ===",
  );

  console.log(
    "ext:",
    ext,
  );

  console.log(
    "isImage:",
    isImage,
  );

  console.log(
    "hasVideoFormats:",
    hasVideoFormats,
  );

  console.log(
    "info.url:",
    info.url,
  );

  console.log(
    "info.thumbnail:",
    info.thumbnail,
  );

  console.log(
    "info.ext:",
    info.ext,
  );

  console.log(
    "formats count:",
    formats.length,
  );

  console.log(
    "=== END getPinMeta DEBUG ===",
  );

  // Check if this is a carousel
  // (multiple entries)
  const entries =
    info.entries as
      | Array<
          Record<string, unknown>
        >
      | undefined;

  if (
    Array.isArray(entries) &&
    entries.length > 1
  ) {
    return {
      id:
        (info.id as string) ||
        randomBytes(
          4,
        ).toString("hex"),
      title:
        (info.title as string) ||
        null,
      hasVideo: false,
      isCarousel: true,
    };
  }

  // If no video formats and
  // it's not clearly a video —
  // treat as image
  if (!hasVideoFormats) {
    return {
      id:
        (info.id as string) ||
        randomBytes(
          4,
        ).toString("hex"),
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

  return {
    id:
      (info.id as string) ||
      randomBytes(
        4,
      ).toString("hex"),
    title:
      (info.title as string) ||
      null,
    hasVideo: true,
  };
}

function getGalleryDlCommand(): string {
  if (
    process.env.GALLERY_DL_PATH
  ) {
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
      );

      const timeout =
        setTimeout(() => {
          proc.kill("SIGKILL");

          reject(
            new Error("TIMEOUT"),
          );
        }, 120_000);

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
          const chunk =
            d.toString();

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

// Find every image recursively.
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
        results.push(
          fullPath,
        );
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

// Convert a normal static image to
// a full-colour, lossless PNG.
//
// GIF is intentionally excluded because
// animated GIF -> PNG would lose animation.
async function convertImageToPng(
  inputPath: string,
): Promise<string> {
  const ext =
    path.extname(
      inputPath,
    ).toLowerCase();

  if (ext === ".gif") {
    return inputPath;
  }

  if (ext === ".png") {
    return inputPath;
  }

  const pngPath =
    path.join(
      path.dirname(inputPath),
      `${path.basename(
        inputPath,
        ext,
      )}.png`,
    );

  await sharp(inputPath)
    .withMetadata()
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: false,
    })
    .toFile(pngPath);

  // Remove original JPG/JPEG/WebP
  // after successful conversion.
  try {
    if (
      inputPath !== pngPath &&
      fs.existsSync(inputPath)
    ) {
      fs.unlinkSync(inputPath);
    }
  } catch {
    // best-effort
  }

  return pngPath;
}

// Convert every static image in a carousel
// to PNG before creating the ZIP.
async function convertCarouselImagesToPng(
  images: string[],
  onStage?: (
    label: string,
  ) => void,
): Promise<string[]> {
  const converted: string[] = [];

  for (
    let i = 0;
    i < images.length;
    i++
  ) {
    const image =
      images[i];

    onStage?.(
      `Processing image ${i + 1} of ${images.length}...`,
    );

    const convertedPath =
      await convertImageToPng(
        image,
      );

    converted.push(
      convertedPath,
    );
  }

  return converted;
}

// Download image or carousel.
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

  onStage?.(
    "Downloading image...",
  );

  // First try gallery-dl.
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

    let images =
      findAllImages(
        outputDir,
      );

    console.log(
      `gallery-dl found ${images.length} image(s)`,
    );

    // Multiple images = carousel
    if (
      images.length > 1
    ) {
      onStage?.(
        "Processing carousel images...",
      );

      images =
        await convertCarouselImagesToPng(
          images,
          onStage,
        );

      onStage?.(
        "Packaging carousel...",
      );

      const zipPath =
        path.join(
          outputDir,
          `pinme-carousel-${pinId}.zip`,
        );

      await new Promise<void>(
        (resolve, reject) => {
          const output =
            fs.createWriteStream(
              zipPath,
            );

          const archive =
            archiver("zip", {
              zlib: {
                level: 9,
              },
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
        imageCount: images.length,
      };
    }

    // Exactly one image
    if (
      images.length === 1
    ) {
      onStage?.(
        "Processing image...",
      );

      const pngPath =
        await convertImageToPng(
          images[0],
        );

      return {
        filePath: pngPath,
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

  // Fallback: direct image URL
  if (imageUrl) {
    console.log(
      "=== Direct image fetch fallback ===",
    );

    try {
      const res =
        await fetch(imageUrl);

      if (res.ok) {
        const buffer =
          Buffer.from(
            await res.arrayBuffer(),
          );

        const extMatch =
          imageUrl.match(
            /\.(jpg|jpeg|png|webp|gif)/i,
          );

        const ext =
          extMatch
            ? extMatch[1].toLowerCase()
            : "jpg";

        const originalPath =
          path.join(
            outputDir,
            `${pinId}.${ext}`,
          );

        fs.writeFileSync(
          originalPath,
          buffer,
        );

        console.log(
          "Saved directly:",
          originalPath,
        );

        const filePath =
          await convertImageToPng(
            originalPath,
          );

        return {
          filePath,
          mediaType: "image",
          imageCount: 1,
        };
      }
    } catch (err) {
      console.log(
        "Direct fetch failed:",
        err,
      );
    }
  }

  throw new Error(
    "NO_FILE: no image found for this pin",
  );
}

// Download video using the highest
// quality available from the source.
//
// No quality selector is exposed to users.
// yt-dlp automatically chooses the best
// available video + best available audio.
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

  await runYtDlp(
    [
      "--no-playlist",
      "--no-warnings",
      "--concurrent-fragments",
      "4",

      // Highest available native video
      // + highest available audio.
      //
      // No artificial resolution cap.
      "--format",
      "bestvideo+bestaudio/best",

      // When separate video/audio streams
      // are selected, merge them into MP4.
      "--merge-output-format",
      "mp4",

      "-o",
      outputTemplate,

      url,
    ],
    (line) => {
      if (
        !mergeSignalled &&
        line.includes(
          "[Merger]",
        )
      ) {
        mergeSignalled =
          true;

        onStage?.(
          "Processing video...",
        );
      }
    },
  );

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

  // Fallback: find any file
  // with this pinId prefix.
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

      fs.unlinkSync(fp);

      throw new Error(
        "NO_VIDEO",
      );
    }
  }

  throw new Error(
    "NO_FILE: output file not found after yt-dlp succeeded",
  );
}

function buildFilename(
  title: string | null,
  filePath: string,
): string {
  const ext =
    path.extname(
      filePath,
    ).slice(1) ||
    "mp4";

  // Carousel ZIP filename
  if (
    ext.toLowerCase() ===
    "zip"
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

// POST /api/get-pin
router.post(
  "/get-pin",
  async (req, res) => {
    const {
      url,
    } =
      req.body as {
        url?: string;
      };

    // Validate before opening
    // the SSE stream.
    if (
      !url ||
      typeof url !==
        "string" ||
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

    // Open SSE stream
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
      // Stage 1 — metadata
      send({
        type: "stage",
        label:
          "Fetching info...",
      });

      const meta =
        await getPinMeta(
          trimmed,
        );

      // Stage 2 — download
      let filePath: string;

      let mediaType:
        | "video"
        | "image"
        | "carousel";

      let imageCount:
        | number
        | undefined;

      // Images and carousels both come through
      // downloadImageOrCarousel().
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
      } else {
        send({
          type: "stage",
          label:
            "Downloading video...",
        });

        // No quality argument here.
        // Backend always uses best available.
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

      // Stage 4 — build token
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

// GET /api/stream/:token
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
    } else {
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
          // Retry also automatically uses
          // the highest available quality.
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

    const fileStream =
      fs.createReadStream(
        filePath,
      );

    const removeFailedDownload =
      () => {
        pendingDownloads.delete(
          token,
        );

        try {
          fs.unlinkSync(
            filePath,
          );
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

    fileStream.pipe(res);
  },
);

export default router;