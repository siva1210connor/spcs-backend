import { createUploader } from "./upload.factory.js";

export const sliderUpload = createUploader({
  folder: "slider",
});
export const notificationUpload = createUploader({
  folder: "notifications",
});

export const bookCoverUpload = createUploader({
  folder: "books",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize: 10 * 1024 * 1024,
});

export const bulletinUpload = createUploader({
  folder: "bulletins",
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  maxFileSize: 30 * 1024 * 1024,
});

export const catalogueUpload = createUploader({
  folder: "catalogues",
  allowedMimeTypes: ["application/pdf"],
  maxFileSize: 50 * 1024 * 1024,
});

export const archiveUpload = createUploader({
  folder: "archives",
  allowedMimeTypes: [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  maxFileSize: 50 * 1024 * 1024,
});

export const awardUpload = createUploader({
  folder: "awards",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize: 10 * 1024 * 1024,
});

export const offerUpload = createUploader({
  folder: "offers",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize: 10 * 1024 * 1024,
});

export const schemeUpload = createUploader({
  folder: "schemes",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize: 10 * 1024 * 1024,
});
export const eventImageUpload = createUploader({
  folder: "events",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxFileSize: 10 * 1024 * 1024,
});

export const eventAttachmentUpload = createUploader({
  folder: "event-attachments",
  allowedMimeTypes: ["application/pdf"],
  maxFileSize: 5 * 1024 * 1024,
});

import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { makeError } from "../utils/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// create folders
const eventsDir = path.join(projectRoot, "uploads", "events");
const attachmentsDir = path.join(projectRoot, "uploads", "event-attachments");

fs.mkdirSync(eventsDir, { recursive: true });
fs.mkdirSync(attachmentsDir, { recursive: true });

// storage logic
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") return cb(null, eventsDir);
    if (file.fieldname === "attachment") return cb(null, attachmentsDir);

    return cb(makeError("Invalid upload field", 400, "INVALID_UPLOAD_FIELD"));
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

// file filter
const eventFileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(makeError("Invalid image type", 400), false);
    }
  }

  if (file.fieldname === "attachment") {
    if (file.mimetype !== "application/pdf") {
      return cb(makeError("Only PDF allowed", 400), false);
    }
  }

  cb(null, true);
};

// ✅ THIS IS THE IMPORTANT ONE
export const eventFormUpload = multer({
  storage: eventStorage,
  fileFilter: eventFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const downloadUpload = createUploader({
  folder: "downloads",
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  maxFileSize: 50 * 1024 * 1024,
});

export const adUpload = createUploader({
  folder: "ads",
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  maxFileSize: 50 * 1024 * 1024,
});