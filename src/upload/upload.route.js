// src/upload/upload.routes.js
import { Router } from "express";
import { uploadMiddleware } from "./multer.config.js";
import { validate } from "../middleware/validate.middleware.js";
import { adminUploadSchema } from "./upload.validator.js";
import { adminUploadController } from "./upload.controller.js";

export const adminUploadRouter = Router();

/**
 * Base: {{base_url}}/admin/uploads
 *
 * multipart/form-data
 * fields:
 * - module: string
 * - file: binary
 */
adminUploadRouter.post(
  "/",
  uploadMiddleware.single("file"),
  validate(adminUploadSchema),
  adminUploadController
);