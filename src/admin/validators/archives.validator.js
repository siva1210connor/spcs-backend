// src/admin/validators/archives.validator.js
import { z } from "zod";

const nullableString = (max = 500) =>
  z.string().max(max).nullable().optional();

const validDateString = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "must be a valid date");

export const adminListArchivesSchema = z.object({
  query: z.object({
    search: z.string().optional().transform((v) => {
      const value = v?.trim();
      return value ? value : undefined;
    }),
  }).optional(),
});
export const adminCreateArchiveSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "title is required").max(250),
    year: z.coerce
      .number()
      .int()
      .min(1900, "invalid year")
      .max(3000, "invalid year"),
  }),
});

export const adminUpdateArchiveSchema = z.object({
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

export const adminDeleteArchiveSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});

export const adminDownloadArchiveSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});