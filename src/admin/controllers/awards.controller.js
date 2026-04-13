// src/admin/services/awards.service.js
import { prisma } from "../../config/prisma.js";
import { adminCreateAward, adminDeleteAward, adminListAwards, adminUpdateAward } from "../services/awards.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function mapAwardType(type) {
  return type === "aksharapuraskaram" ? "AKSHARAPURASKARAM" : "AWARDED";
}

function mapAwardRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    type: row.type === "AKSHARAPURASKARAM" ? "aksharapuraskaram" : "awarded",
    image_url: row.imageUrl ?? null,
  };
}

export const adminListAwardsController = asyncHandler(async (req, res) => {
  const data = await adminListAwards({ query: req.validated.query });
  return ok(res, data, "Awards fetched");
});

export const adminCreateAwardController = asyncHandler(async (req, res) => {
  const data = await adminCreateAward({
    req,
    input: req.validated.body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

export const adminUpdateAwardController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const body = req.validated.body ?? {};
  const hasBodyFields = Object.keys(body).length > 0;
  const hasImage = Boolean(req.file);

  if (!hasBodyFields && !hasImage) {
    throw makeError(
      "At least one field or file must be provided",
      400,
      "ADMIN_AWARD_UPDATE_EMPTY"
    );
  }

  const data = await adminUpdateAward({
    req,
    id,
    input: body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

export const adminDeleteAwardController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteAward({ req, id });
  return ok(res, data, data.msg);
});