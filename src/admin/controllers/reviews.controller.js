// src/admin/controllers/reviews.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListReviews,
  adminUpdateReview,
  adminDeleteReview,
} from "../services/reviews.service.js";

export const adminReviewsListController = asyncHandler(async (req, res) => {
  const data = await adminListReviews({ query: req.validated.query });
  return ok(res, data, "Reviews fetched");
});

export const adminReviewsUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { status } = req.validated.body;
  const data = await adminUpdateReview({ req, id, status });
  return ok(res, data, data.msg);
});

export const adminReviewsDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteReview({ req, id });
  return ok(res, data, data.msg);
});
