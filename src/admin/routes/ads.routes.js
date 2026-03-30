// src/admin/routes/ads.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListAdsSchema,
  adminCreateAdSchema,
  adminUpdateAdSchema,
  adminDeleteAdSchema,
} from "../validators/ads.validator.js";
import {
  adminAdsListController,
  adminAdsCreateController,
  adminAdsUpdateController,
  adminAdsDeleteController,
} from "../controllers/ads.controller.js";
import { adUpload } from "../../middleware/upload.js";
export const adminAdsRouter = Router();

/**
 * Base: {{base_url}}/admin/ads
 */

adminAdsRouter.get("/", validate(adminListAdsSchema), adminAdsListController);
adminAdsRouter.post(
  "/",
  adUpload.single("image"),
  validate(adminCreateAdSchema),
  adminAdsCreateController
);
adminAdsRouter.put("/:id", validate(adminUpdateAdSchema), adminAdsUpdateController);
adminAdsRouter.delete("/:id", validate(adminDeleteAdSchema), adminAdsDeleteController);