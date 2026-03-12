// src/admin/validators/catalogue.validator.js
import { z } from "zod";

const nullableString = (max = 500) =>
  z.string().max(max).nullable().optional();

export const adminListCatalogueSchema = z.object({
  query: z.object({
    search: z.string().optional().transform((v) => v?.trim()),
  }).optional(),
});

export const adminCreateCatalogueSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title is required").max(250),
    file_url: z.string().url("file_url must be a valid URL"),
    file_type: nullableString(100),
    file_size: nullableString(100),
    uploaded_date: z
      .string()
      .optional()
      .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "uploaded_date must be a valid date"),
  }),
});

export const adminUpdateCatalogueSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().min(1).max(250).optional(),
      file_url: z.string().url("file_url must be a valid URL").optional(),
      file_type: nullableString(100),
      file_size: nullableString(100),
      uploaded_date: z
        .string()
        .optional()
        .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "uploaded_date must be a valid date"),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const adminDeleteCatalogueSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});