// src/admin/controllers/ads.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListAds,
  adminCreateAd,
  adminUpdateAd,
  adminDeleteAd,
} from "../services/ads.service.js";

export const adminAdsListController = asyncHandler(async (req, res) => {
  const data = await adminListAds();
  return ok(res, data, "Ads fetched");
});

export const adminAdsCreateController = asyncHandler(async (req, res) => {
  console.log("req.file =>", req.file);
  console.log("req.body =>", req.body);
  const data = await adminCreateAd(req, req.validated.body);
  return ok(res, data, data.msg);
});

export const adminAdsUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const input = req.validated.body ?? {};

  const hasBodyFields =
    input.type !== undefined ||
    Object.prototype.hasOwnProperty.call(input, "link");

  const hasImage = Boolean(req.file);

  if (!hasBodyFields && !hasImage) {
    throw makeError(
      "At least one field or file must be provided",
      400,
      "ADMIN_AD_UPDATE_EMPTY",
    );
  }
  const data = await adminUpdateAd({
    req,
    id,
    input,
    file: req.file,
  });
  return ok(res, data, data.msg);
});

export const adminAdsDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteAd({ req, id });
  return ok(res, data, data.msg);
});
