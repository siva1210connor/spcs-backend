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

// Helpers to map route section -> OrderType enum
function typeFromSection(section) {
  if (section === "book") return "BOOK";
  if (section === "ebook") return "EBOOK";
  if (section === "audiobook") return "AUDIOBOOK";
  return null;
}

/**
 * GET /api/admin/orders/:section
 */
export const adminOrdersListController = asyncHandler(async (req, res) => {
  const type = typeFromSection(req.params.section);
  if (!type) {
    const err = new Error("Invalid order section");
    err.statusCode = 400;
    err.code = "INVALID_ORDER_SECTION";
    throw err;
  }

  const data = await listOrders({ type, query: req.validated.query });
  return ok(res, data, "Orders fetched");
});

/**
 * GET /api/admin/orders/:section/order/:orderId
 */
export const adminOrderDetailController = asyncHandler(async (req, res) => {
  const type = typeFromSection(req.params.section);
  if (!type) {
    const err = new Error("Invalid order section");
    err.statusCode = 400;
    err.code = "INVALID_ORDER_SECTION";
    throw err;
  }

  const { orderId } = req.validated.params;
  const data = await getOrderDetail({ type, orderId });
  return ok(res, data, "Order fetched");
});

/**
 * PUT /api/admin/orders/toggleStatus
 * body: { order_id, status: fullfill | cancel }
 */
export const adminToggleStatusController = asyncHandler(async (req, res) => {
  const { order_id, status } = req.validated.body;
  const data = await toggleOrderStatus({ orderId: order_id, action: status });
  return ok(res, data, data.msg);
});

/**
 * PUT /api/admin/orders/refund
 * body: { order_id }
 */
export const adminRefundController = asyncHandler(async (req, res) => {
  const { order_id } = req.validated.body;
  const data = await refundOrder({ orderId: order_id });
  return ok(res, data, data.msg);
});

/**
 * DELETE /api/admin/orders/order
 * body: { order_id }
 */
export const adminDeleteOrderController = asyncHandler(async (req, res) => {
  const { order_id } = req.validated.body;
  const data = await deleteOrder({ orderId: order_id });
  return ok(res, data, data.msg);
});