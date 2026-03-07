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
 * Base: {{base_url}}/admin/orders
 */

adminOrdersRouter.get("/:section", validate(listOrdersSchema), adminOrdersListController);

adminOrdersRouter.get("/:section/order/:orderId", validate(getOrderDetailSchema), adminOrderDetailController);

adminOrdersRouter.put("/toggleStatus", validate(toggleOrderStatusSchema), adminToggleStatusController);
adminOrdersRouter.put("/refund", validate(refundOrderSchema), adminRefundController);
adminOrdersRouter.delete("/order", validate(deleteOrderSchema), adminDeleteOrderController);