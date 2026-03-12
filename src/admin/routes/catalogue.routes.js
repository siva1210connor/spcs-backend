// src/admin/routes/catalogue.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListCatalogueSchema,
  adminCreateCatalogueSchema,
  adminUpdateCatalogueSchema,
  adminDeleteCatalogueSchema,
} from "../validators/catalogue.validator.js";
import {
  adminCatalogueListController,
  adminCatalogueCreateController,
  adminCatalogueUpdateController,
  adminCatalogueDeleteController,
} from "../controllers/catalogue.controller.js";

export const adminCatalogueRouter = Router();

/**
 * Base: {{base_url}}/admin/catalogue
 */

adminCatalogueRouter.get("/", validate(adminListCatalogueSchema), adminCatalogueListController);
adminCatalogueRouter.post("/", validate(adminCreateCatalogueSchema), adminCatalogueCreateController);
adminCatalogueRouter.put("/:id", validate(adminUpdateCatalogueSchema), adminCatalogueUpdateController);
adminCatalogueRouter.delete("/:id", validate(adminDeleteCatalogueSchema), adminCatalogueDeleteController);