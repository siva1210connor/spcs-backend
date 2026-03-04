// src/controllers/categories.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { listCategories } from "../services/categories.service.js";

/**
 * GET /api/categories
 */
export const listCategoriesController = asyncHandler(async (req, res) => {
  const items = await listCategories();
  return ok(res, { items }, "Categories fetched successfully");
});