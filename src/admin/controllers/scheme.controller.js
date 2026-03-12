// src/admin/controllers/scheme.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListScheme,
  adminCreateScheme,
  adminUpdateScheme,
  adminDeleteScheme,
} from "../services/scheme.service.js";

export const adminSchemeListController = asyncHandler(async (req, res) => {
  const data = await adminListScheme({ query: req.validated.query });
  return ok(res, data, "Scheme fetched");
});

export const adminSchemeCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateScheme({ req, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminSchemeUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminUpdateScheme({ req, id, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminSchemeDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteScheme({ req, id });
  return ok(res, data, data.msg);
});
