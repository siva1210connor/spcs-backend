// src/admin/routes/dashboard.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminDashboardSchema,
  listSlidersSchema,
  updateSliderSchema,
  deleteSliderSchema,
  createSliderSchema,
} from "../validators/dashboard.validator.js";
import {
  adminDashboardController,
  adminSliderListController,
  adminSliderUpdateController,
  adminSliderDeleteController,
  adminSliderCreateController,
} from "../controllers/dashboard.controller.js";

export const adminDashboardRouter = Router();

/**
 * Base: /api/admin/dashboard
 */
adminDashboardRouter.get("/", validate(adminDashboardSchema), adminDashboardController);

/**
 * Slider APIs (Base: /api/admin/dashboard/slider)
 */
adminDashboardRouter.get("/slider", validate(listSlidersSchema), adminSliderListController);
adminDashboardRouter.post("/slider", validate(createSliderSchema), adminSliderCreateController);
adminDashboardRouter.put("/slider/:id", validate(updateSliderSchema), adminSliderUpdateController);
adminDashboardRouter.delete("/slider/:id", validate(deleteSliderSchema), adminSliderDeleteController);