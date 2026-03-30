// src/admin/routes/archives.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListArchivesSchema,
  adminCreateArchiveSchema,
  adminUpdateArchiveSchema,
  adminDeleteArchiveSchema,
  adminDownloadArchiveSchema,
} from "../validators/archives.validator.js";
import {
  adminArchivesListController,
  adminArchivesCreateController,
  adminArchivesUpdateController,
  adminArchivesDeleteController,
  adminArchivesDownloadController,
} from "../controllers/archives.controller.js";
import { archiveUpload } from "../../middleware/upload.js"
export const adminArchivesRouter = Router();

/**
 * Base: {{base_url}}/admin/archives
 */

adminArchivesRouter.get("/", validate(adminListArchivesSchema), adminArchivesListController);
adminArchivesRouter.get("/download/:id", validate(adminDownloadArchiveSchema), adminArchivesDownloadController);
adminArchivesRouter.post(
  "/",
  archiveUpload.single("archive_file"),
  validate(adminCreateArchiveSchema),
  adminArchivesCreateController
);
adminArchivesRouter.put(
  "/:id",
  archiveUpload.single("archive_file"),
  validate(adminUpdateArchiveSchema),
  adminArchivesUpdateController
);
adminArchivesRouter.delete("/:id", validate(adminDeleteArchiveSchema), adminArchivesDeleteController);