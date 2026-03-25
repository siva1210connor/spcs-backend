import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { makeError } from "../utils/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, "_");
}

export function createUploader({
  folder = "misc",
  allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize = 30 * 1024 * 1024,
} = {}) {
  const uploadDir = path.join(projectRoot, "uploads", folder);

  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = sanitizeFileName(
        path.basename(file.originalname, ext)
      );
      const uniqueName = `${Date.now()}-${baseName}${ext}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        makeError(
          "Invalid file type",
          400,
          "INVALID_FILE_TYPE"
        ),
        false
      );
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
    },
  });
}
