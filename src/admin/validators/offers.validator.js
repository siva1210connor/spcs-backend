// src/admin/validators/offers.validator.js
import { z } from "zod";

export const listOffersSchema = z.object({
  query: z.object({}).optional(),
});

const offerItemSchema = z.object({
  offer_image_url: z.string().url("offer_image_url must be a valid URL"),
  link: z.string().max(2000).nullable().optional(), // allow null
});

export const upsertOffersSchema = z.object({
  body: z.array(offerItemSchema).min(0),
});

export const deleteOfferSchema = z.object({
  params: z.object({
    offerId: z.string().min(1, "offerId is required"),
  }),
});