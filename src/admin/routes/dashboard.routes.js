// src/admin/routes/dashboard.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminDashboardSchema,
  listSlidersSchema,
  updateSliderSchema,
  deleteSliderSchema,
  createSliderSchema,

  // notification schema
  listNotificationsSchema,
  createNotificationSchema,
  updateNotificationSchema,
  deleteNotificationSchema,

  //branches schema
  listBranchesSchema,
  createBranchSchema,
  updateBranchSchema,
  deleteBranchSchema,


} from "../validators/dashboard.validator.js";
import {
  adminDashboardController,
  // slider functions 
  adminSliderListController,
  adminSliderUpdateController,
  adminSliderDeleteController,
  adminSliderCreateController,
  // notification functions
  adminNotificationListController,
  adminNotificationCreateController,
  adminNotificationUpdateController,
  adminNotificationDeleteController,
  //branch functions 
  adminBranchListController,
  adminBranchCreateController,
  adminBranchUpdateController,
  adminBranchDeleteController,
} from "../controllers/dashboard.controller.js";


import { multerErrorHandler } from "../../middleware/multerError.middleware.js";
import { sliderUpload, notificationUpload } from "../../middleware/upload.js";

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



/**
 * Notification APIs (Base: /api/admin/dashboard/notifications)
 */
adminDashboardRouter.get(
  "/notifications",
  validate(listNotificationsSchema),
  adminNotificationListController,
);

adminDashboardRouter.post(
  "/notifications",
  notificationUpload.single("notification_image"),
  multerErrorHandler,
  validate(createNotificationSchema),
  adminNotificationCreateController,
);

adminDashboardRouter.put(
  "/notifications/:id",
  notificationUpload.single("notification_image"),
  multerErrorHandler,
  validate(updateNotificationSchema),
  adminNotificationUpdateController,
);

adminDashboardRouter.delete(
  "/notifications/:id",
  validate(deleteNotificationSchema),
  adminNotificationDeleteController,
);

/**
 * Branch APIs (Base: /api/admin/dashboard/branches)
 */
adminDashboardRouter.get(
  "/branches",
  validate(listBranchesSchema),
  adminBranchListController,
);

adminDashboardRouter.post(
  "/branches",
  validate(createBranchSchema),
  adminBranchCreateController,
);

adminDashboardRouter.put(
  "/branches/:id",
  validate(updateBranchSchema),
  adminBranchUpdateController,
);

adminDashboardRouter.delete(
  "/branches/:id",
  validate(deleteBranchSchema),
  adminBranchDeleteController,
);