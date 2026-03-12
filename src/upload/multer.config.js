// src/upload/multer.config.js
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { MAX_FILE_SIZE_BYTES } from "./upload.constants.js";

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, "0");

        const uploadDir = path.join(process.cwd(), "uploads", year, month);
        ensureDir(uploadDir);

        cb(null, uploadDir);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const ext = path.extname(file.originalname || "");
        const random = crypto.randomBytes(16).toString("hex");
        const safeName = `${Date.now()}-${random}${ext}`;
        cb(null, safeName);
      } catch (err) {
        cb(err);
      }
    },
  });
}

export const uploadMiddleware = multer({
  storage: createStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});