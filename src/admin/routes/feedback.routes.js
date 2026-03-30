// src/admin/routes/feedback.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListFeedbackSchema,
  adminReplyFeedbackSchema,
  adminDeleteFeedbackSchema,
} from "../validators/feedback.validator.js";
import {
  adminFeedbackListController,
  adminFeedbackReplyController,
  adminFeedbackDeleteController,
} from "../controllers/feedback.controller.js";

export const adminFeedbackRouter = Router();

/**
 * Base: {{base_url}}/admin/feedback
 */

adminFeedbackRouter.get("/", validate(adminListFeedbackSchema), adminFeedbackListController);
adminFeedbackRouter.post(
  "/reply/:id",
  validate(adminReplyFeedbackSchema),
  adminFeedbackReplyController
);
adminFeedbackRouter.delete(
  "/:id",
  validate(adminDeleteFeedbackSchema),
  adminFeedbackDeleteController
);