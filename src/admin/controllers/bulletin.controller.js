// src/admin/controllers/bulletin.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListBulletin,
  adminCreateBulletin,
  adminUpdateBulletin,
  adminDeleteBulletin,
} from "../services/bulletin.service.js";

export const adminBulletinListController = asyncHandler(async (req, res) => {
  const data = await adminListBulletin({ req, query: req.validated.query });
  return ok(res, data, "Bulletin fetched");
});

export const adminBulletinCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateBulletin({
    req,
    input: req.validated.body,
    files: req.files,
  });
  return ok(res, data, data.msg);
});

export const adminBulletinUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const body = req.validated.body ?? {};
  const hasBodyFields = Object.keys(body).length > 0;
  const hasCoverImage = Boolean(req.files?.cover_image?.[0]);
  const hasBulletinPdf = Boolean(req.files?.bulletin_pdf?.[0]);

  if (!hasBodyFields && !hasCoverImage && !hasBulletinPdf) {
    throw makeError(
      "At least one field or file must be provided",
      400,
      "ADMIN_BULLETIN_UPDATE_EMPTY",
    );
  }
  const data = await adminUpdateBulletin({
    req,
    id,
    input: req.validated.body,
    files: req.files,
  });
  return ok(res, data, data.msg);
});

export const adminBulletinDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteBulletin({ req, id });
  return ok(res, data, data.msg);
});
