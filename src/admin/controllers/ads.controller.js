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
  const data = await adminCreateAd(res, req.validated.body);
  return ok(res, data, data.msg);
});

export const adminAdsUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminUpdateAd({ res, id, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminAdsDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteAd({ req, id });
  return ok(res, data, data.msg);
});
