// src/admin/validators/awards.validator.js
import { z } from "zod";

const awardTypeSchema = z
  .string()
  .transform((v) => v.toLowerCase())
  .refine(
    (v) => ["aksharapuraskaram", "awarded"].includes(v),
    "type must be aksharapuraskaram or awarded"
  );

const nullableString = (max = 5000) =>
  z.string().max(max).nullable().optional();

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();

export const adminListAwardsSchema = z.object({
  query: z.object({}).optional(),
});

export const adminCreateAwardSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title is required").max(250),
    description: nullableString(5000),
    type: awardTypeSchema,
    image_url: nullableUrl(),
  }),
});

export const adminUpdateAwardSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().min(1).max(250).optional(),
      description: nullableString(5000),
      type: awardTypeSchema.optional(),
      image_url: nullableUrl(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const adminDeleteAwardSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});