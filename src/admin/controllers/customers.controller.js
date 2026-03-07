// src/admin/controllers/customers.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { adminListCustomers } from "../services/customers.service.js";

/**
 * GET /api/admin/customers
 */
export const adminCustomersListController = asyncHandler(async (req, res) => {
  const data = await adminListCustomers({ query: req.validated.query });
  return ok(res, data, "Customers fetched");
});