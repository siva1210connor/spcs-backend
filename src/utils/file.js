import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

export function getAbsoluteUploadPath(relativePath = "") {
  const cleanPath = relativePath.replace(/^\/+/, "");
  return path.join(projectRoot, cleanPath);
}

export async function deleteFileIfExists(relativePath) {
  if (!relativePath) return;

  try {
    const absolutePath = getAbsoluteUploadPath(relativePath);
    await fs.unlink(absolutePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}
