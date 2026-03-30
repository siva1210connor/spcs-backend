// src/admin/validators/scheme.validator.js
import { z } from "zod";

const nullableString = (max = 5000) =>
  z.string().max(max).nullable().optional();

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();

const schemeStatusSchema = z
  .string()
  .transform((v) => v.toUpperCase())
  .refine((v) => ["ACTIVE", "INACTIVE"].includes(v), {
    message: "status must be ACTIVE or INACTIVE",
  });
export const adminListSchemeSchema = z.object({
  query: z
    .object({
      search: z.string().optional().transform((v) => v?.trim()),
    })
    .optional(),
});

export const adminCreateSchemeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "title is required").max(250),
    description: nullableString(5000).optional(),
    status: schemeStatusSchema.optional(),
  }),
});

export const adminUpdateSchemeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(250).optional(),
    description: nullableString(5000).optional(),
    status: schemeStatusSchema.optional(),
  }),
});

export const adminDeleteSchemeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});