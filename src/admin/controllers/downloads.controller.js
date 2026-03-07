// src/admin/controllers/downloads.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListDownloads,
  adminCreateDownload,
  adminUpdateDownload,
  adminDeleteDownload,
} from "../services/downloads.service.js";

export const adminDownloadsListController = asyncHandler(async (req, res) => {
  const data = await adminListDownloads({ query: req.validated.query });
  return ok(res, data, "Downloads fetched");
});

export const adminDownloadsCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateDownload(req.validated.body);
  return ok(res, data, data.msg);
});

export const adminDownloadsUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminUpdateDownload({ id, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminDownloadsDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteDownload({ id });
  return ok(res, data, data.msg);
});