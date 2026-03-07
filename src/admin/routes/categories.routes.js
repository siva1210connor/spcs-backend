// src/admin/routes/categories.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListCategoriesSchema,
  adminCreateCategorySchema,
  adminUpdateCategorySchema,
  adminDeleteCategorySchema,
} from "../validators/categories.validator.js";
import {
  adminCategoriesListController,
  adminCategoryCreateController,
  adminCategoryUpdateController,
  adminCategoryDeleteController,
} from "../controllers/categories.controller.js";

export const adminCategoriesRouter = Router();

/**
 * Base: {{base_url}}/admin/categories
 */

adminCategoriesRouter.get("/", validate(adminListCategoriesSchema), adminCategoriesListController);
adminCategoriesRouter.post("/", validate(adminCreateCategorySchema), adminCategoryCreateController);
adminCategoriesRouter.put("/:categoryId", validate(adminUpdateCategorySchema), adminCategoryUpdateController);
adminCategoriesRouter.delete("/:categoryId", validate(adminDeleteCategorySchema), adminCategoryDeleteController);