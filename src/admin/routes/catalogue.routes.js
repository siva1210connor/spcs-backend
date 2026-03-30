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

import { catalogueUpload } from "../../middleware/upload.js"
export const adminCatalogueRouter = Router();

/**
 * Base: {{base_url}}/admin/catalogue
 */

adminCatalogueRouter.get("/", validate(adminListCatalogueSchema), adminCatalogueListController);
adminCatalogueRouter.post(
  "/",
  catalogueUpload.single("catalog_pdf"),
  validate(adminCreateCatalogueSchema),
  adminCatalogueCreateController
);
adminCatalogueRouter.put(
  "/:id",
  catalogueUpload.single("catalog_pdf"),
  validate(adminUpdateCatalogueSchema),
  adminCatalogueUpdateController
);
adminCatalogueRouter.delete("/:id", validate(adminDeleteCatalogueSchema), adminCatalogueDeleteController);