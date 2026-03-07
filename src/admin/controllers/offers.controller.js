// src/admin/controllers/offers.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListOffers,
  adminReplaceOffers,
  adminDeleteOffer,
} from "../services/offers.service.js";

/**
 * GET {{base_url}}/admin/offers
 */
export const adminOffersListController = asyncHandler(async (req, res) => {
  const data = await adminListOffers();
  return ok(res, data, "Offers fetched");
});

/**
 * PUT {{base_url}}/admin/offers
 * Body: [{ offer_image_url, link }]
 */
export const adminOffersUpsertController = asyncHandler(async (req, res) => {
  const data = await adminReplaceOffers(req.validated.body);
  return ok(res, data, data.msg);
});

/**
 * DELETE {{base_url}}/admin/offers/:offerId
 */
export const adminOfferDeleteController = asyncHandler(async (req, res) => {
  const { offerId } = req.validated.params;
  const data = await adminDeleteOffer(offerId);
  return ok(res, data, data.msg);
});