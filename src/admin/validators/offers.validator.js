// src/admin/validators/offers.validator.js
import { z } from "zod";
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1),
  limit: z.coerce.number().int().min(1).max(100),
});
export const listOffersSchema = z.object({
  query: z.object({
    page: paginationSchema.shape.page.optional(),
    limit: paginationSchema.shape.limit.optional(),
  }).optional(),
});

export const adminCreateOfferSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "title is required").max(250),
    link: z.string().trim().url("link must be a valid URL"),
  }),
});



export const updateOfferSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, "offerId is required"),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(250).optional(),
      link: z.string().trim().url("link must be a valid URL").optional(),
    })
    .optional()
    .default({}),
});;

export const deleteOfferSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, "offerId is required"),
  }),
});