// src/admin/routes/events.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListEventsSchema,
  adminCreateEventSchema,
  adminUpdateEventSchema,
  adminDeleteEventSchema,
} from "../validators/events.validator.js";
import {
  adminEventsListController,
  adminEventsCreateController,
  adminEventsUpdateController,
  adminEventsDeleteController,
} from "../controllers/events.controller.js";

export const adminEventsRouter = Router();

/**
 * Base: {{base_url}}/admin/events
 */

adminEventsRouter.get("/", validate(adminListEventsSchema), adminEventsListController);
adminEventsRouter.post("/", validate(adminCreateEventSchema), adminEventsCreateController);
adminEventsRouter.put("/:id", validate(adminUpdateEventSchema), adminEventsUpdateController);
adminEventsRouter.delete("/:id", validate(adminDeleteEventSchema), adminEventsDeleteController);