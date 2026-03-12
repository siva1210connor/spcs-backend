// src/admin/controllers/categories.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../services/categories.service.js";

/**
 * GET {{base_url}}/admin/categories
 */
export const adminCategoriesListController = asyncHandler(async (req, res) => {
  const data = await adminListCategories({ query: req.validated.query });
  return ok(res, data, "Categories fetched");
});

/**
 * POST {{base_url}}/admin/categories
 */
export const adminCategoryCreateController = asyncHandler(async (req, res) => {
  const { name } = req.validated.body;
  const data = await adminCreateCategory({ req, name });
  return ok(res, data, "Category created");
});

/**
 * PUT {{base_url}}/admin/categories/:categoryId
 */
export const adminCategoryUpdateController = asyncHandler(async (req, res) => {
  const { categoryId } = req.validated.params;
  const { name } = req.validated.body;
  const data = await adminUpdateCategory({ req, categoryId, name });
  return ok(res, data, "Category updated");
});

/**
 * DELETE {{base_url}}/admin/categories/:categoryId
 */
export const adminCategoryDeleteController = asyncHandler(async (req, res) => {
  const { categoryId } = req.validated.params;
  const data = await adminDeleteCategory({ req, categoryId });
  return ok(res, data, data.msg);
});
