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
import { multerErrorHandler } from "../../middleware/multerError.middleware.js";
import { sliderUpload } from "../../middleware/upload.js";

export const adminDashboardRouter = Router();

/**
 * Base: /api/admin/dashboard
 */
adminDashboardRouter.get(
  "/",
  validate(adminDashboardSchema),
  adminDashboardController,
);

/**
 * Slider APIs (Base: /api/admin/dashboard/slider)
 */
adminDashboardRouter.get(
  "/slider",
  validate(listSlidersSchema),
  adminSliderListController,
);

//added multer and upload handling for slider creation
adminDashboardRouter.post(
  "/slider",
  sliderUpload.single("slider_image"), // 1. multer
  multerErrorHandler, // 2. handle multer errors
  validate(createSliderSchema), // 3. validation
  adminSliderCreateController, // 4. controller
);
adminDashboardRouter.put(
  "/slider/:id",
  sliderUpload.single("slider_image"), // 1. multer
  multerErrorHandler, // 2. handle multer errors
  validate(updateSliderSchema),
  adminSliderUpdateController,
);
adminDashboardRouter.delete(
  "/slider/:id",
  validate(deleteSliderSchema),
  adminSliderDeleteController,
);
