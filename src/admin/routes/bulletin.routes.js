// src/admin/routes/bulletin.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListBulletinSchema,
  adminCreateBulletinSchema,
  adminUpdateBulletinSchema,
  adminDeleteBulletinSchema,
} from "../validators/bulletin.validator.js";
import {
  adminBulletinListController,
  adminBulletinCreateController,
  adminBulletinUpdateController,
  adminBulletinDeleteController,
} from "../controllers/bulletin.controller.js";
import { bulletinUpload } from "../../middleware/upload.js";
export const adminBulletinRouter = Router();

/**
 * Base: {{base_url}}/admin/bulletin
 */

adminBulletinRouter.get("/", validate(adminListBulletinSchema), adminBulletinListController);
adminBulletinRouter.post(
  "/",
  bulletinUpload.fields([
    { name: "cover_image", maxCount: 1 },
    { name: "bulletin_pdf", maxCount: 1 },
  ]),
  validate(adminCreateBulletinSchema),
  adminBulletinCreateController
);
adminBulletinRouter.put(
  "/:id",
  bulletinUpload.fields([
    { name: "cover_image", maxCount: 1 },
    { name: "bulletin_pdf", maxCount: 1 },
  ]),
  validate(adminUpdateBulletinSchema),
  adminBulletinUpdateController
);
adminBulletinRouter.delete("/:id", validate(adminDeleteBulletinSchema), adminBulletinDeleteController);