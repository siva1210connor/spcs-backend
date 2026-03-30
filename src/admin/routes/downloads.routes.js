// src/admin/routes/downloads.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListDownloadsSchema,
  adminCreateDownloadSchema,
  adminUpdateDownloadSchema,
  adminDeleteDownloadSchema,
} from "../validators/downloads.validator.js";
import {
  adminDownloadsListController,
  adminDownloadsCreateController,
  adminDownloadsUpdateController,
  adminDownloadsDeleteController,
} from "../controllers/downloads.controller.js";

export const adminDownloadsRouter = Router();
import { downloadUpload } from "../../middleware/upload.js"
/**
 * Base: {{base_url}}/admin/downloads
 */

adminDownloadsRouter.get("/", validate(adminListDownloadsSchema), adminDownloadsListController);
adminDownloadsRouter.post(
  "/",
  downloadUpload.single("file"),
  validate(adminCreateDownloadSchema),
  adminDownloadsCreateController
);
adminDownloadsRouter.put(
  "/:id",
  downloadUpload.single("file"),
  validate(adminUpdateDownloadSchema),
  adminDownloadsUpdateController
);
adminDownloadsRouter.delete("/:id", validate(adminDeleteDownloadSchema), adminDownloadsDeleteController); 