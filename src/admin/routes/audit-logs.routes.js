// src/admin/routes/audit-logs.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { adminListAuditLogsSchema } from "../validators/audit-logs.validator.js";
import { adminAuditLogsListController } from "../controllers/audit-logs.controller.js";

export const adminAuditLogsRouter = Router();

/**
 * Base: {{base_url}}/admin/audit-logs
 */

adminAuditLogsRouter.get(
  "/",
  validate(adminListAuditLogsSchema),
  adminAuditLogsListController,
);