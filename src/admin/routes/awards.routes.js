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
  adminListAwards,
  adminCreateAward,
  adminUpdateAward,
  adminDeleteAward
} from "../controllers/awards.controller.js";

export const adminAwardsRouter = Router();

/**
 * Base: {{base_url}}/admin/awards
 */

adminAwardsRouter.get("/", validate(adminListAwardsSchema), adminListAwards);
adminAwardsRouter.post("/", validate(adminCreateAwardSchema), adminCreateAward);
adminAwardsRouter.put("/:id", validate(adminUpdateAwardSchema), adminUpdateAward);
adminAwardsRouter.delete("/:id", validate(adminDeleteAwardSchema), adminDeleteAward);