// src/admin/controllers/archives.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListArchives,
  adminCreateArchive,
  adminUpdateArchive,
  adminDeleteArchive,
  adminDownloadArchive,
} from "../services/archives.service.js";
import fs from "fs";
import path from "path";
export const adminArchivesListController = asyncHandler(async (req, res) => {
  const data = await adminListArchives({ query: req.validated.query });
  return ok(res, data, "Archives fetched");
});

export const adminArchivesCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateArchive({
    req,
    input: req.validated.body,
    file: req.file,
  });
  return ok(res, data, data.msg);
});

export const adminArchivesUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const body = req.validated.body ?? {};
  const hasBodyFields = Object.keys(body).length > 0;
  const hasArchiveFile = Boolean(req.file);

  if (!hasBodyFields && !hasArchiveFile) {
    throw makeError(
      "At least one field or file must be provided",
      400,
      "ADMIN_ARCHIVE_UPDATE_EMPTY"
    );
  }

  const data = await adminUpdateArchive({
    req,
    id,
    input: body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

export const adminArchivesDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteArchive({ req, id });
  return ok(res, data, data.msg);
});

export const adminArchivesDownloadController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const archive = await adminDownloadArchive({ id });

  if (!archive.fileUrl) {
    throw makeError("Archive file not found", 404, "ADMIN_ARCHIVE_FILE_NOT_FOUND");
  }
  const filePath = path.resolve(process.cwd(), `.${archive.fileUrl}`);
  if (!fs.existsSync(filePath)) {
    throw makeError("Archive file not found", 404, "ADMIN_ARCHIVE_FILE_NOT_FOUND");
  }
  return res.download(filePath, path.basename(filePath));
});