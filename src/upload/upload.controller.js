// src/upload/upload.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { createMediaAsset } from "./upload.service.js";

export const adminUploadController = asyncHandler(async (req, res) => {
  const { module } = req.validated.body;
  const uploadedById = req.user?.sub ?? null;

  const data = await createMediaAsset({
    req,
    file: req.file,
    module,
    uploadedById,
  });

  return ok(res, data, "File uploaded successfully");
});