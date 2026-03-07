// src/admin/controllers/rules.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListRules,
  adminCreateRule,
  adminUpdateRule,
  adminDeleteRule,
} from "../services/rules.service.js";

export const adminRulesListController = asyncHandler(async (req, res) => {
  const data = await adminListRules({ query: req.validated.query });
  return ok(res, data, "Rules fetched");
});

export const adminRulesCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateRule(req.validated.body);
  return ok(res, data, data.msg);
});

export const adminRulesUpdateController = asyncHandler(async (req, res) => {
  const { ruleId } = req.validated.params;
  const data = await adminUpdateRule({ ruleId, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminRulesDeleteController = asyncHandler(async (req, res) => {
  const { ruleId } = req.validated.params;
  const data = await adminDeleteRule({ ruleId });
  return ok(res, data, data.msg);
});