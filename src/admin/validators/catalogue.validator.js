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
    title: z.string().trim().min(1, "title is required").max(250),
    year: z.coerce
      .number()
      .int()
      .min(1900, "invalid year")
      .max(3000, "invalid year"),
  }),
});

export const adminUpdateCatalogueSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(250).optional(),
      year: z.coerce
        .number()
        .int()
        .min(1900, "invalid year")
        .max(3000, "invalid year")
        .optional(),
    })
    .optional()
    .default({}),
});

export const adminDeleteCatalogueSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});