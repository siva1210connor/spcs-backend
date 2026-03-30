// src/admin/validators/categories.validator.js
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
    .transform((v) => (v ? Number(v) : 50))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 200, "limit must be 1..200"),
});

export const adminListCategoriesSchema = z.object({
  query: z
    .object({
      search: z.string().optional().transform((v) => v?.trim()),
      page: paginationSchema.shape.page,
      limit: paginationSchema.shape.limit,
    })
    .optional(),
});

export const adminCreateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .transform((v) => v.trim())
      .refine((v) => v.length >= 2, "name too short")
      .refine((v) => v.length <= 100, "name too long"),
  }),
});

export const adminUpdateCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().cuid("Invalid categoryId"),
  }),
  body: z.object({
    name: z
      .string()
      .transform((v) => v.trim())
      .refine((v) => v.length >= 2, "name too short")
      .refine((v) => v.length <= 100, "name too long"),
  }),
});

export const adminDeleteCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, "categoryId required"),
  }),
});