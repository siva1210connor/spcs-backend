// src/upload/upload.service.js
import path from "path";
import { prisma } from "../config/prisma.js";
import { MIME_GROUPS } from "./upload.constants.js";
import { createAdminAuditLog } from "../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../audit/audit.constants.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function resolveMediaType(mimeType) {
  if (MIME_GROUPS.IMAGE.includes(mimeType)) return "IMAGE";
  if (MIME_GROUPS.DOCUMENT.includes(mimeType)) return "DOCUMENT";
  if (MIME_GROUPS.AUDIO.includes(mimeType)) return "AUDIO";
  return "OTHER";
}

function validateMimeType(mimeType) {
  const allAllowed = [
    ...MIME_GROUPS.IMAGE,
    ...MIME_GROUPS.DOCUMENT,
    ...MIME_GROUPS.AUDIO,
  ];

  if (!allAllowed.includes(mimeType)) {
    throw makeError("Unsupported file type", 400, "UNSUPPORTED_FILE_TYPE");
  }
}

function buildPublicUrl(req, absolutePath) {
  const normalized = absolutePath.replace(process.cwd(), "").replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}${normalized}`;
}

function buildStorageKey(absolutePath) {
  return absolutePath.replace(process.cwd(), "").replace(/\\/g, "/").replace(/^\/+/, "");
}

export async function createMediaAsset({ req, file, module, uploadedById }) {
  try {
    if (!file) {
      throw makeError("File is required", 400, "FILE_REQUIRED");
    }

    validateMimeType(file.mimetype);

    const mediaType = resolveMediaType(file.mimetype);
    const publicUrl = buildPublicUrl(req, file.path);
    const storageKey = buildStorageKey(file.path);

    const created = await prisma.mediaAsset.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        mediaType,
        provider: "LOCAL",
        storageKey,
        publicUrl,
        module,
        uploadedById: uploadedById ?? null,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        storageKey: true,
        publicUrl: true,
        module: true,
      },
    });

    const response = {
      id: created.id,
      url: created.publicUrl,
      key: created.storageKey,
      mime_type: created.mimeType,
      size_bytes: created.sizeBytes,
      original_name: created.originalName,
      module: created.module,
    };

    await createAdminAuditLog({
      req,
      action: "UPLOAD",
      resourceType: AUDIT_RESOURCE_TYPES.UPLOAD,
      resourceId: created.id,
      message: `File uploaded for module: ${module}`,
      beforeJson: null,
      afterJson: response,
      adminId: uploadedById ?? null,
    });

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError("Failed to upload file", 500, "UPLOAD_FAILED", err);
  }
}