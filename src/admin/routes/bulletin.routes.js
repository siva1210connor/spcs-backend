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

export const adminBulletinRouter = Router();

/**
 * Base: {{base_url}}/admin/bulletin
 */

adminBulletinRouter.get("/", validate(adminListBulletinSchema), adminBulletinListController);
adminBulletinRouter.post("/", validate(adminCreateBulletinSchema), adminBulletinCreateController);
adminBulletinRouter.put("/:id", validate(adminUpdateBulletinSchema), adminBulletinUpdateController);
adminBulletinRouter.delete("/:id", validate(adminDeleteBulletinSchema), adminBulletinDeleteController);