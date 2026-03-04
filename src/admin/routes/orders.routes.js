// src/admin/routes/orders.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  listOrdersSchema,
  getOrderDetailSchema,
  toggleOrderStatusSchema,
  refundOrderSchema,
  deleteOrderSchema,
} from "../validators/orders.validator.js";
import {
  adminOrdersListController,
  adminOrderDetailController,
  adminToggleStatusController,
  adminRefundController,
  adminDeleteOrderController,
} from "../controllers/orders.controller.js";

export const adminOrdersRouter = Router();

/**
 * Base: /api/admin/orders
 */

// List by section: book | ebook | audiobook
adminOrdersRouter.get("/:section(book|ebook|audiobook)", validate(listOrdersSchema), adminOrdersListController);

// Detail
adminOrdersRouter.get(
  "/:section(book|ebook|audiobook)/order/:orderId",
  validate(getOrderDetailSchema),
  adminOrderDetailController
);

// Toggle status
adminOrdersRouter.put("/toggleStatus", validate(toggleOrderStatusSchema), adminToggleStatusController);

// Refund
adminOrdersRouter.put("/refund", validate(refundOrderSchema), adminRefundController);

// Delete
adminOrdersRouter.delete("/order", validate(deleteOrderSchema), adminDeleteOrderController);