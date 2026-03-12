// src/admin/validators/reviews.validator.js
import { z } from "zod";

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

const reviewFilterSchema = z
  .string()
  .optional()
  .transform((v) => v ?? "all")
  .refine(
    (v) => ["all", "pending", "active", "published", "rejected"].includes(v),
    "filter must be one of all | pending | active | published | rejected"
  );

export const adminListReviewsSchema = z.object({
  query: z.object({
    filter: reviewFilterSchema,
    search: z.string().optional().transform((v) => v?.trim()),
    rating: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined))
      .refine((v) => v === undefined || (Number.isInteger(v) && v >= 1 && v <= 5), "rating must be 1..5"),
    page: paginationSchema.shape.page,
    limit: paginationSchema.shape.limit,
  }),
});

export const adminUpdateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z.object({
    status: z
      .string()
      .transform((v) => v.toLowerCase())
      .refine(
        (v) => ["pending", "active", "published", "rejected"].includes(v),
        "status must be pending | active | published | rejected"
      ),
  }),
});

export const adminDeleteReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});