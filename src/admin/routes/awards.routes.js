// src/admin/routes/awards.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListAwardsSchema,
  adminCreateAwardSchema,
  adminUpdateAwardSchema,
  adminDeleteAwardSchema,
} from "../validators/awards.validator.js";
import {
  adminListAwardsController,
  adminCreateAwardController,
  adminUpdateAwardController,
  adminDeleteAwardController
} from "../controllers/awards.controller.js";
import { awardUpload } from "../../middleware/upload.js";
export const adminAwardsRouter = Router();

/**
 * Base: {{base_url}}/admin/awards
 */

adminAwardsRouter.get("/", validate(adminListAwardsSchema), adminListAwardsController);
adminAwardsRouter.post(
  "/",
  awardUpload.single("image"),
  validate(adminCreateAwardSchema),
  adminCreateAwardController
);
adminAwardsRouter.put(
  "/:id",
  awardUpload.single("image"),
  validate(adminUpdateAwardSchema),
  adminUpdateAwardController
);
adminAwardsRouter.delete(
  "/:id",
  validate(adminDeleteAwardSchema),
  adminDeleteAwardController
);