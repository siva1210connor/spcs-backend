// src/admin/controllers/offers.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
} from "../services/offers.service.js";

/**
 * GET {{base_url}}/admin/offers
 */
export const adminOffersListController = asyncHandler(async (req, res) => {
  const data = await adminListOffers({ query: req.validated.query });
  return ok(res, data, "Offers fetched");
});

export const adminCreateOfferController = asyncHandler(async (req, res) => {
  const data = await adminCreateOffer({
    req,
    input: req.validated.body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});
/**
 * PUT {{base_url}}/admin/offers
 * Body: [{ offer_image_url, link }]
 */
export const adminOfferUpdateController = asyncHandler(async (req, res) => {
  const { offerId } = req.validated.params;

  const body = req.validated.body ?? {};
  const hasBodyFields = Object.keys(body).length > 0;
  const hasImage = Boolean(req.file);

  if (!hasBodyFields && !hasImage) {
    throw makeError(
      "At least one field or file must be provided",
      400,
      "ADMIN_OFFER_UPDATE_EMPTY",
    );
  }

  const data = await adminUpdateOffer({
    req,
    offerId,
    input: body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

/**
 * DELETE {{base_url}}/admin/offers/:offerId
 */
export const adminOfferDeleteController = asyncHandler(async (req, res) => {
  const { offerId } = req.validated.params;
  const data = await adminDeleteOffer(req, offerId);
  return ok(res, data, data.msg);
});
