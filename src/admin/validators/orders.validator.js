// src/admin/validators/orders.validator.js
import { z } from "zod";

const sectionSchema = z.object({
  params: z.object({
    section: z.enum(["book", "ebook", "audiobook"]),
  }),
});

const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine((n) => Number.isInteger(n) && n >= 1, "page must be >= 1"),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 100, "limit must be 1..100"),
});

const dateDDMMYYYY = z
  .string()
  .optional()
  .refine((v) => !v || /^\d{2}-\d{2}-\d{4}$/.test(v), "date must be DD-MM-YYYY");

const statusFilter = z
  .string()
  .optional()
  .transform((v) => v ?? "all")
  .refine(
    (v) =>
      ["all", "pending", "fulfilled", "shipped", "completed", "refunded", "cancelled"].includes(v),
    "filter invalid"
  );

export const listOrdersSchema = sectionSchema.extend({
  query: z.object({
    filter: statusFilter,
    query: z.string().optional().transform((v) => v?.trim()),
    from_date: dateDDMMYYYY,
    to_date: dateDDMMYYYY,
    page: paginationSchema.shape.page,
    limit: paginationSchema.shape.limit,
  }),
});

export const getOrderDetailSchema = sectionSchema.extend({
  params: sectionSchema.shape.params.extend({
    orderId: z.string().min(1, "orderId required"),
  }),
});

export const toggleOrderStatusSchema = z.object({
  body: z.object({
    order_id: z.string().min(1, "order_id required"),
    status: z
      .string()
      .transform((v) => v.toLowerCase())
      .refine((v) => ["fullfill", "cancel"].includes(v), "status must be fullfill | cancel"),
  }),
});

export const refundOrderSchema = z.object({
  body: z.object({
    order_id: z.string().min(1, "order_id required"),
  }),
});

export const deleteOrderSchema = z.object({
  body: z.object({
    order_id: z.string().min(1, "order_id required"),
  }),
});