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

export const adminArchivesListController = asyncHandler(async (req, res) => {
  const data = await adminListArchives({ query: req.validated.query });
  return ok(res, data, "Archives fetched");
});

export const adminArchivesCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateArchive({ req, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminArchivesUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminUpdateArchive({ req,id, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminArchivesDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteArchive({ req, id });
  return ok(res, data, data.msg);
});

export const adminArchivesDownloadController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDownloadArchive({ id });
  return ok(res, data, data.msg);
});