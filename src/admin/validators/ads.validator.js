// src/admin/validators/ads.validator.js
import { z } from "zod";

const adTypeSchema = z
  .string()
  .transform((v) => v.toLowerCase())
  .refine((v) => ["square", "banner"].includes(v), "type must be square or banner");

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();

export const adminListAdsSchema = z.object({
  query: z.object({}).optional(),
});

export const adminCreateAdSchema = z.object({
  body: z.object({
    type: adTypeSchema,
    ad_image_url: z.string().url("ad_image_url must be a valid URL"),
    link: nullableUrl(),
  }),
});

export const adminUpdateAdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      type: adTypeSchema.optional(),
      ad_image_url: z.string().url("ad_image_url must be a valid URL").optional(),
      link: nullableUrl(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const adminDeleteAdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});