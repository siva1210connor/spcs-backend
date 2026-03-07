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
  adminAwardsListController,
  adminAwardsCreateController,
  adminAwardsUpdateController,
  adminAwardsDeleteController,
} from "../controllers/awards.controller.js";

export const adminAwardsRouter = Router();

/**
 * Base: {{base_url}}/admin/awards
 */

adminAwardsRouter.get("/", validate(adminListAwardsSchema), adminAwardsListController);
adminAwardsRouter.post("/", validate(adminCreateAwardSchema), adminAwardsCreateController);
adminAwardsRouter.put("/:id", validate(adminUpdateAwardSchema), adminAwardsUpdateController);
adminAwardsRouter.delete("/:id", validate(adminDeleteAwardSchema), adminAwardsDeleteController);