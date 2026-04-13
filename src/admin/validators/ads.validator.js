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

const adPlacementSchema = z
  .string()
  .transform((v) => v.toLowerCase())
  .refine(
    (v) => ["sidebar_square", "top_banner"].includes(v),
    "type must be sidebar_square or top_banner"
  );

export const adminCreateAdSchema = z.object({
  body: z.object({
    type: adPlacementSchema,
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