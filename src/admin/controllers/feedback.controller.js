// src/admin/controllers/feedback.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListFeedback,
  adminReplyFeedback,
  adminDeleteFeedback,
} from "../services/feedback.service.js";

export const adminFeedbackListController = asyncHandler(async (req, res) => {
  const data = await adminListFeedback({ query: req.validated.query });
  return ok(res, data, "Feedback fetched");
});

export const adminFeedbackReplyController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { message } = req.validated.body;
  const data = await adminReplyFeedback({ req,id, message });
  return ok(res, data, data.msg);
});

export const adminFeedbackDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteFeedback({ req, id });
  return ok(res, data, data.msg);
});