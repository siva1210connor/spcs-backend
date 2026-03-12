// src/upload/upload.constants.js

export const ALLOWED_MODULES = [
  "slider",
  "gallery",
  "catalogue",
  "downloads",
  "archives",
  "bulletin",
  "ads",
  "offers",
  "awards",
  "scheme",
  "books",
  "events",
  "general",
];

export const MIME_GROUPS = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/gif",
  ],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  AUDIO: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/aac",
  ],
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB