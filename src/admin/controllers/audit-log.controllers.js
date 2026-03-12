// src/admin/controllers/audit-logs.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { adminListAuditLogs } from "../services/audit-logs.service.js";

export const adminAuditLogsListController = asyncHandler(async (req, res) => {
  const data = await adminListAuditLogs({ query: req.validated.query });
  return ok(res, data, "Audit logs fetched");
});