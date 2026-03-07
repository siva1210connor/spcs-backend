// src/admin/controllers/events.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
} from "../services/events.service.js";

export const adminEventsListController = asyncHandler(async (req, res) => {
  const { type } = req.validated.query;
  const data = await adminListEvents({ type });
  return ok(res, data, "Events fetched");
});

export const adminEventsCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateEvent(req.validated.body);
  return ok(res, data, data.msg);
});

export const adminEventsUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminUpdateEvent({ id, input: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminEventsDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteEvent({ id });
  return ok(res, data, data.msg);
});