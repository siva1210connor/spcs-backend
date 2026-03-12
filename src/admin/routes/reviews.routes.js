// src/admin/routes/reviews.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListReviewsSchema,
  adminUpdateReviewSchema,
  adminDeleteReviewSchema,
} from "../validators/reviews.validator.js";
import {
  adminReviewsListController,
  adminReviewsUpdateController,
  adminReviewsDeleteController,
} from "../controllers/reviews.controller.js";

export const adminReviewsRouter = Router();

/**
 * Base: {{base_url}}/admin/reviews
 */

adminReviewsRouter.get("/", validate(adminListReviewsSchema), adminReviewsListController);
adminReviewsRouter.put("/:id", validate(adminUpdateReviewSchema), adminReviewsUpdateController);
adminReviewsRouter.delete("/:id", validate(adminDeleteReviewSchema), adminReviewsDeleteController);