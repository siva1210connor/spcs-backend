// src/admin/validators/customers.validator.js
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

const dateDDMMYYYY = z
  .string()
  .optional()
  .refine((v) => !v || /^\d{2}-\d{2}-\d{4}$/.test(v), "date must be DD-MM-YYYY");

export const adminListCustomersSchema = z.object({
  query: z.object({
    search: z
      .string()
      .optional()
      .transform((v) => {
        const value = v?.trim();
        return value ? value : undefined;
      }),
    from_date: dateDDMMYYYY.optional(),
    to_date: dateDDMMYYYY.optional(),
    page: paginationSchema.shape.page.optional(),
    limit: paginationSchema.shape.limit.optional(),
  }),
});