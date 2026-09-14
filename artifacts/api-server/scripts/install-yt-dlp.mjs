import { chmod, mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const installDir = path.resolve(process.cwd(), "vendor");
const destination = path.join(installDir, "yt-dlp");
const temporaryDestination = `${destination}.tmp`;
const downloadUrl =
  process.env.YT_DLP_DOWNLOAD_URL ??
  "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

async function isUsableBinary(filePath) {
  try {
    const file = await stat(filePath);
    return file.isFile() && file.size > 0;
  } catch {
    return false;
  }
}

async function installYtDlp() {
  if (await isUsableBinary(destination)) {
    console.log(`Using existing yt-dlp binary at ${destination}`);
    return;
  }

  await mkdir(installDir, { recursive: true });
  console.log(`Downloading yt-dlp from ${downloadUrl}`);

  const response = await fetch(downloadUrl, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`yt-dlp download failed with HTTP ${response.status}`);
  }

  const binary = Buffer.from(await response.arrayBuffer());
  if (binary.length === 0) {
    throw new Error("yt-dlp download returned an empty file");
  }

  await writeFile(temporaryDestination, binary);
  await chmod(temporaryDestination, 0o755);
  await rename(temporaryDestination, destination);
  console.log(`Installed yt-dlp binary at ${destination}`);
}

installYtDlp().catch(async (error) => {
  try {
    await rename(temporaryDestination, `${temporaryDestination}.failed`);
  } catch {
    // There may not be a partial download to clean up.
  }
  console.error(error);
  process.exit(1);
});