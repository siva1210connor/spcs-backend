// src/admin/validators/awards.validator.js
import { z } from "zod";

const awardTypeSchema = z
  .string()
  .transform((v) => v.toLowerCase())
  .refine(
    (v) => ["aksharapuraskaram", "awarded"].includes(v),
    "type must be aksharapuraskaram or awarded"
  );

const nullableString = (max = 5000) =>
  z.string().trim().max(max).nullable().optional();

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1),
  limit: z.coerce.number().int().min(1).max(100),
});
export const adminListAwardsSchema = z.object({
  query: z.object({
    page: paginationSchema.shape.page.optional(),
    limit: paginationSchema.shape.limit.optional(),
  }).optional(),
});

export const adminCreateAwardSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "title is required").max(250),
    description: nullableString(5000),
    type: awardTypeSchema,
  }),
})

export const adminUpdateAwardSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(250).optional(),
      description: nullableString(5000),
      type: awardTypeSchema.optional(),
    })
    .optional()
    .default({}),
});

export const adminDeleteAwardSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});