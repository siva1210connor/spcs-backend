// src/admin/services/orders.service.js
import { prisma } from "../../config/prisma.js";
import { createAdminAuditLog } from "../../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../../audit/audit.constants.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function parseDDMMYYYY(s, endOfDay = false) {
  if (!s) return null;
  const [dd, mm, yyyy] = s.split("-").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

function mapFilterToStatus(filter) {
  if (!filter || filter === "all") return null;
  return filter.toUpperCase(); // pending -> PENDING etc.
}

function buildWhere({ type, filter, query, from_date, to_date }) {
  const where = { type };

  const status = mapFilterToStatus(filter);
  if (status) where.status = status;

  const from = parseDDMMYYYY(from_date, false);
  const to = parseDDMMYYYY(to_date, true);
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  if (query) {
    // search by order id OR customer name (user.name) OR orderNo
    where.OR = [
      { id: { contains: query, mode: "insensitive" } },
      { orderNo: { contains: query, mode: "insensitive" } },
      { user: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function listOrders({ type, query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = buildWhere({ type, ...query });

    const [total, rows] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          orderNo: true,
          createdAt: true,
          status: true,
          total: true,
          user: { select: { name: true } },
        },
      }),
    ]);

    return {
      items: rows.map((o) => ({
        order_id: o.orderNo ?? o.id,
        order_date: o.createdAt,
        amount: o.total,
        status: o.status.toLowerCase(),
        customer_name: o.user?.name ?? "Unknown",
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError(
      "Failed to list orders",
      500,
      "ADMIN_ORDERS_LIST_FAILED",
      err,
    );
  }
}

export async function getOrderDetail({ type, orderId }) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        type,
        OR: [{ id: orderId }, { orderNo: orderId }],
      },
      select: {
        id: true,
        orderNo: true,
        transactionId: true,
        createdAt: true,
        status: true,

        subtotal: true,
        shippingCharge: true,
        total: true,

        discount: { select: { discountCode: true, discountPrice: true } },

        user: { select: { name: true, email: true, phone: true } },

        shippingAddress: {
          select: {
            name: true,
            address: true,
            district: true,
            state: true,
            pinCode: true,
          },
        },

        items: {
          select: {
            quantity: true,
            price: true,
            book: { select: { name: true } },
          },
        },
      },
    });

    if (!order)
      throw makeError("Order not found", 404, "ADMIN_ORDER_NOT_FOUND");

    const discountPrice = order.discount?.discountPrice ?? 0;

    return {
      order_id: order.orderNo ?? order.id,
      transation_id: order.transactionId ?? null,
      order_date: order.createdAt,
      status: order.status.toLowerCase(),

      payment: {
        subtotal: order.subtotal,
        discount: discountPrice,
        shipping_charge: order.shippingCharge,
        sub_total: order.total,
      },

      order_items: order.items.map((i) => ({
        name: i.book?.name ?? "Unknown",
        quantity: i.quantity,
        price: i.price,
      })),

      user_info: {
        name: order.user?.name ?? null,
        email: order.user?.email ?? null,
        phone: order.user?.phone ?? null,
      },

      shipping_address: {
        name: order.shippingAddress?.name ?? null,
        address: order.shippingAddress?.address ?? null,
        district: order.shippingAddress?.district ?? null,
        state: order.shippingAddress?.state ?? null,
        pin_code: order.shippingAddress?.pinCode ?? null,
      },
    };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to fetch order detail",
      500,
      "ADMIN_ORDER_DETAIL_FAILED",
      err,
    );
  }
}

export async function toggleOrderStatus({ req, orderId, action }) {
  try {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNo: true,
        status: true,
        type: true,
        total: true,
        userId: true,
      },
    });

    if (!existing) {
      throw makeError("Order not found", 404, "ADMIN_ORDER_NOT_FOUND");
    }
    const nextStatus = action === "fullfill" ? "FULFILLED" : "CANCELLED";

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      select: {
        id: true,
        orderNo: true,
        status: true,
        type: true,
        total: true,
        userId: true,
      },
    });

    await createAdminAuditLog({
      req,
      action: "STATUS_CHANGE",
      resourceType: AUDIT_RESOURCE_TYPES.ORDER,
      resourceId: updated.id,
      message: `Order status changed to ${updated.status}`,
      beforeJson: existing,
      afterJson: updated,
    });

    return { msg: "status updated", status: updated.status.toLowerCase() };
  } catch (err) {
    if (err?.code === "P2025")
      throw makeError("Order not found", 404, "ADMIN_ORDER_NOT_FOUND", err);
    throw makeError(
      "Failed to update order status",
      500,
      "ADMIN_ORDER_STATUS_FAILED",
      err,
    );
  }
}

export async function refundOrder({ req, orderId }) {
  try {
    // NOTE: This is a stub. Integrate payment gateway refund later.
    // For now: mark as REFUNDED if currently paid/fulfilled etc.

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNo: true,
        status: true,
        type: true,
        total: true,
        userId: true,
      },
    });

    if (!existing) {
      throw makeError("Order not found", 404, "ADMIN_ORDER_NOT_FOUND");
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
      select: {
        id: true,
        orderNo: true,
        status: true,
        type: true,
        total: true,
        userId: true,
      },
    });

    await createAdminAuditLog({
      req,
      action: "REFUND",
      resourceType: AUDIT_RESOURCE_TYPES.ORDER,
      resourceId: updated.id,
      message: "Order refunded",
      beforeJson: existing,
      afterJson: updated,
    });

    return { msg: "refund initiated successfully", order_id: updated.id };
  } catch (err) {
    if (err?.code === "P2025")
      throw makeError("Order not found", 404, "ADMIN_ORDER_NOT_FOUND", err);
    throw makeError(
      "Failed to refund order",
      500,
      "ADMIN_ORDER_REFUND_FAILED",
      err,
    );
  }
}

export async function deleteOrder({ req, orderId }) {
  try {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNo: true,
        status: true,
        type: true,
        total: true,
        userId: true,
      },
    });

    if (!existing) {
      throw makeError("Order not found", 404, "ADMIN_ORDER_NOT_FOUND");
    }
    await prisma.order.delete({ where: { id: orderId } });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.ORDER,
      resourceId: existing.id,
      message: "Order deleted",
      beforeJson: existing,
      afterJson: null,
    });
    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025")
      throw makeError("Order not found", 404, "ADMIN_ORDER_NOT_FOUND", err);
    throw makeError(
      "Failed to delete order",
      500,
      "ADMIN_ORDER_DELETE_FAILED",
      err,
    );
  }
}
