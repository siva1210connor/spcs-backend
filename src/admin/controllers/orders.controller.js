// src/admin/controllers/orders.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  listOrders,
  getOrderDetail,
  toggleOrderStatus,
  refundOrder,
  deleteOrder,
} from "../services/orders.service.js";

// Map validated route section -> OrderType enum
function typeFromSection(section) {
  if (section === "book") return "BOOK";
  if (section === "ebook") return "EBOOK";
  return "AUDIOBOOK"; // section validated by Zod, so only these 3 exist
}

/**
 * GET {{base_url}}/admin/orders/:section
 */
export const adminOrdersListController = asyncHandler(async (req, res) => {
  const section = req.validated.params.section; // ✅ validated
  const type = typeFromSection(section);

  const data = await listOrders({ type, query: req.validated.query });
  return ok(res, data, "Orders fetched");
});

/**
 * GET {{base_url}}/admin/orders/:section/order/:orderId
 */
export const adminOrderDetailController = asyncHandler(async (req, res) => {
  const section = req.validated.params.section; // ✅ validated
  const type = typeFromSection(section);

  const { orderId } = req.validated.params;
  const data = await getOrderDetail({ type, orderId });
  return ok(res, data, "Order fetched");
});

/**
 * PUT {{base_url}}/admin/orders/toggleStatus
 * body: { order_id, status: fullfill | cancel }
 */
export const adminToggleStatusController = asyncHandler(async (req, res) => {
  const { order_id, status } = req.validated.body;
  const data = await toggleOrderStatus({ orderId: order_id, action: status });
  return ok(res, data, data.msg);
});

/**
 * PUT {{base_url}}/admin/orders/refund
 * body: { order_id }
 */
export const adminRefundController = asyncHandler(async (req, res) => {
  const { order_id } = req.validated.body;
  const data = await refundOrder({ orderId: order_id });
  return ok(res, data, data.msg);
});

/**
 * DELETE {{base_url}}/admin/orders/order
 * body: { order_id }
 */
export const adminDeleteOrderController = asyncHandler(async (req, res) => {
  const { order_id } = req.validated.body;
  const data = await deleteOrder({ orderId: order_id });
  return ok(res, data, data.msg);
});