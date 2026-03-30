// src/admin/validators/bulletin.validator.js
import { z } from "zod";

const nullableString = (max = 500) =>
  z.string().max(max).nullable().optional();

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1),
  limit: z.coerce.number().int().min(1).max(100),
});
const validDateString = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "must be a valid date");

export const adminListBulletinSchema = z.object({
  query: z.object({
    search: z.string().optional().transform((v) => {
      const value = v?.trim();
      return value ? value : undefined;
    }),
    page: paginationSchema.shape.page.optional(),
    limit: paginationSchema.shape.limit.optional(),
  }).optional(),
});

export const adminCreateBulletinSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "title is required").max(250),
    year: z.coerce.number().int().min(1900, "invalid year").max(3000, "invalid year"),
    month: z.string().trim().min(1, "month is required").max(20, "month is too long"),
  }),
});

export const adminUpdateBulletinSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(250).optional(),
      year: z.coerce.number().int().min(1900, "invalid year").max(3000, "invalid year").optional(),
      month: z.string().trim().min(1, "month is required").max(20, "month is too long").optional(),
    })
    .optional()
    .default({}),
});

export const adminDeleteBulletinSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});