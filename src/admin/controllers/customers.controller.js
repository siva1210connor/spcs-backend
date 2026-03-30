// src/admin/controllers/customers.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import { adminListCustomers, adminExportCustomersCsv } from "../services/customers.service.js";

/**
 * GET /api/admin/customers
 */
export const adminCustomersListController = asyncHandler(async (req, res) => {
  const data = await adminListCustomers({ query: req.validated.query });
  return ok(res, data, "Customers fetched");
});

export const adminCustomersExportCsvController = asyncHandler(async (req, res) => {
  const csv = await adminExportCustomersCsv({ query: req.validated.query });

  const now = new Date().toISOString().slice(0, 10);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="customers-${now}.csv"`);

  return res.status(200).send(csv);
});