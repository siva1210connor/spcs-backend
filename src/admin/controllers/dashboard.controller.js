// src/admin/controllers/dashboard.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  getDashboardStats,
  listSliders,
  createSlider,
  updateSlider,
  deleteSlider,

  // Notification service 
  createNotification,
  listNotifications,
  updateNotification,
  deleteNotification,

  // Branches service
  listBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../services/dashboard.service.js";

export const adminDashboardController = asyncHandler(async (req, res) => {
  const data = await getDashboardStats();
  return ok(res, data, "Dashboard fetched");
});

// Slider

export const adminSliderListController = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const data = await listSliders({ page, limit });
  return ok(res, data, "Sliders fetched");
});
export const adminSliderCreateController = asyncHandler(async (req, res) => {
  const data = await createSlider({
    req,
    body: req.validated.body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

export const adminSliderUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const body = {
    ...req.validated.body,
    slider_img_url: req.file || undefined,
  };

  const data = await updateSlider({ req, id, body });

  return ok(res, data, data.msg);
});

export const adminSliderDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await deleteSlider({ req, id });
  return ok(res, data, data.msg);
});


// Notifications

export const adminNotificationListController = asyncHandler(async (req, res) => {
  const data = await listNotifications({
    query: req.validated.query,
  });

  return ok(res, data, data.msg);
});

export const adminNotificationCreateController = asyncHandler(async (req, res) => {
  const data = await createNotification({
    req,
    body: req.validated.body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

export const adminNotificationUpdateController = asyncHandler(async (req, res) => {
  const data = await updateNotification({
    req,
    notificationId: req.params.id,
    body: req.validated.body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

export const adminNotificationDeleteController = asyncHandler(async (req, res) => {
  const data = await deleteNotification({
    req,
    notificationId: req.params.id,
  });

  return ok(res, data, data.msg);
});


// Branches
export const adminBranchListController = asyncHandler(async (req, res) => {
  const data = await listBranches({
    query: req.validated.query,
  });

  return ok(res, data, data.msg);
});

export const adminBranchCreateController = asyncHandler(async (req, res) => {
  const data = await createBranch({
    req,
    body: req.validated.body,
  });

  return ok(res, data, data.msg);
});

export const adminBranchUpdateController = asyncHandler(async (req, res) => {
  const data = await updateBranch({
    req,
    branchId: req.params.id,
    body: req.validated.body,
  });

  return ok(res, data, data.msg);
});

export const adminBranchDeleteController = asyncHandler(async (req, res) => {
  const data = await deleteBranch({
    req,
    branchId: req.params.id,
  });

  return ok(res, data, data.msg);
});