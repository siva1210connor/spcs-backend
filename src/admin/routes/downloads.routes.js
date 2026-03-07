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

/**
 * Base: {{base_url}}/admin/downloads
 */

adminDownloadsRouter.get("/", validate(adminListDownloadsSchema), adminDownloadsListController);
adminDownloadsRouter.post("/", validate(adminCreateDownloadSchema), adminDownloadsCreateController);
adminDownloadsRouter.put("/:id", validate(adminUpdateDownloadSchema), adminDownloadsUpdateController);
adminDownloadsRouter.delete("/:id", validate(adminDeleteDownloadSchema), adminDownloadsDeleteController);