// src/admin/controllers/me.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { getAdminMe } from "../services/me.service.js";

function requireUserId(req) {
  const userId = req.user?.sub;
  if (!userId) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    err.code = "UNAUTHORIZED";
    throw err;
  }
  return userId;
}

/**
 * GET /api/admin/me
 */
export const adminMeController = asyncHandler(async (req, res) => {
  const adminUserId = requireUserId(req);
  const data = await getAdminMe(adminUserId);
  return ok(res, data, "Admin profile fetched");
});