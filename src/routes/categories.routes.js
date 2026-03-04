// src/routes/categories.routes.js
import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { listCategoriesSchema } from "../validators/categories.validator.js";
import { listCategoriesController } from "../controllers/categories.controller.js";

export const categoriesRouter = Router();

/**
 * Public routes
 * Base path: /api/categories
 */
categoriesRouter.get("/", validate(listCategoriesSchema), listCategoriesController);