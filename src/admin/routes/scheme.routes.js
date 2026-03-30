// src/admin/routes/scheme.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListSchemeSchema,
  adminCreateSchemeSchema,
  adminUpdateSchemeSchema,
  adminDeleteSchemeSchema,
} from "../validators/scheme.validator.js";
import {
  adminSchemeListController,
  adminSchemeCreateController,
  adminSchemeUpdateController,
  adminSchemeDeleteController,
} from "../controllers/scheme.controller.js";

export const adminSchemeRouter = Router();
import { schemeUpload } from "../../middleware/upload.js";
/**
 * Base: {{base_url}}/admin/scheme
 */

adminSchemeRouter.get("/", validate(adminListSchemeSchema), adminSchemeListController);
adminSchemeRouter.post(
  "/",
  schemeUpload.single("scheme_image"),
  validate(adminCreateSchemeSchema),
  adminSchemeCreateController
);
adminSchemeRouter.put(
  "/:id",
  schemeUpload.single("scheme_image"),
  validate(adminUpdateSchemeSchema),
  adminSchemeUpdateController
);
adminSchemeRouter.delete("/:id", validate(adminDeleteSchemeSchema), adminSchemeDeleteController);