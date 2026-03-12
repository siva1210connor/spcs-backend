// src/admin/validators/archives.validator.js
import { z } from "zod";

const nullableString = (max = 500) =>
  z.string().max(max).nullable().optional();

const validDateString = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "must be a valid date");

export const adminListArchivesSchema = z.object({
  query: z.object({
    search: z.string().optional().transform((v) => v?.trim()),
  }).optional(),
});

export const adminCreateArchiveSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title is required").max(250),
    uploaded_date: validDateString.optional(),
    file_type: nullableString(100),
    archive_file_url: z.string().url("archive_file_url must be a valid URL"),
  }),
});

export const adminUpdateArchiveSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().min(1).max(250).optional(),
      uploaded_date: validDateString.optional(),
      file_type: nullableString(100),
      archive_file_url: z.string().url("archive_file_url must be a valid URL").optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
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