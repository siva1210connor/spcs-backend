// src/admin/validators/dashboard.validator.js
import { z } from "zod";

const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine((n) => Number.isInteger(n) && n >= 1, "page must be an integer >= 1"),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 100, "limit must be 1..100"),
});

export const adminDashboardSchema = z.object({
  query: z.object({}).optional(),
});

export const listSlidersSchema = z.object({
  query: z.object({
    page: paginationSchema.shape.page,
    limit: paginationSchema.shape.limit,
  }),
});
export const createSliderSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).nullable().optional(),
    slider_url: z.string().url("slider_url must be a valid URL").nullable().optional(),
  }),
});

export const updateSliderSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().min(1).max(200).nullable().optional(),
      slider_url: z.string().url("slider_url must be a valid URL").nullable().optional(),
    })
    .strict()
    .refine((b) => Object.keys(b).length > 0, "At least one field must be provided"),
});

export const deleteSliderSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});