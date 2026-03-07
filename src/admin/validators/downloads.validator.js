// src/admin/validators/downloads.validator.js
import { z } from "zod";

const nullableString = (max = 500) =>
  z.string().max(max).nullable().optional();

export const adminListDownloadsSchema = z.object({
  query: z.object({
    search: z.string().optional().transform((v) => v?.trim()),
  }).optional(),
});

export const adminCreateDownloadSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title is required").max(250),
    file_url: z.string().url("file_url must be a valid URL"),
    file_type: nullableString(100),
    file_size: nullableString(100),
  }),
});

export const adminUpdateDownloadSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().min(1).max(250).optional(),
      file_url: z.string().url("file_url must be a valid URL").optional(),
      file_type: nullableString(100),
      file_size: nullableString(100),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const adminDeleteDownloadSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});