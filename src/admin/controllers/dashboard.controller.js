// src/admin/controllers/dashboard.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  getDashboardStats,
  listSliders,
  createSlider,
  updateSlider,
  deleteSlider,
} from "../services/dashboard.service.js";

export const adminDashboardController = asyncHandler(async (req, res) => {
  const data = await getDashboardStats();
  return ok(res, data, "Dashboard fetched");
});

export const adminSliderListController = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const data = await listSliders({ page, limit });
  return ok(res, data, "Sliders fetched");
});
export const adminSliderCreateController = asyncHandler(async (req, res) => {
  const data = await createSlider({ req,body: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminSliderUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const body = req.validated.body;
  const data = await updateSlider({ req,id, body:req.validated.body });
  return ok(res, data, data.msg);
});

export const adminSliderDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await deleteSlider({ req,id });
  return ok(res, data, data.msg);
});