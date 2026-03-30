// src/admin/validators/downloads.validator.js
import { z } from "zod";

const nullableString = (max = 500) =>
  z.string().max(max).nullable().optional();

export const adminListDownloadsSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
  }).default({}),
});
export const adminCreateDownloadSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "title is required").max(250),
  }),
});

export const adminUpdateDownloadSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(250).optional(),
  }),
});

export const adminDeleteDownloadSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});