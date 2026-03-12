// src/admin/validators/bulletin.validator.js
import { z } from "zod";

const nullableString = (max = 500) =>
  z.string().max(max).nullable().optional();

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();

const validDateString = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "must be a valid date");

export const adminListBulletinSchema = z.object({
  query: z.object({
    search: z.string().optional().transform((v) => v?.trim()),
  }).optional(),
});

export const adminCreateBulletinSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title is required").max(250),
    bulletin_image_url: nullableUrl(),
    date: validDateString,
    file_url: z.string().url("file_url must be a valid URL"),
    file_type: nullableString(100),
    file_size: nullableString(100),
  }),
});

export const adminUpdateBulletinSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().min(1).max(250).optional(),
      bulletin_image_url: nullableUrl(),
      date: validDateString.optional(),
      file_url: z.string().url("file_url must be a valid URL").optional(),
      file_type: nullableString(100),
      file_size: nullableString(100),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const adminDeleteBulletinSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});