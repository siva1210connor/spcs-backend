// src/admin/routes/me.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { adminMeSchema } from "../validators/me.validator.js";
import { adminMeController } from "../controllers/me.controller.js";

export const adminMeRouter = Router();

/**
 * Base path: /api/admin/me
 */
adminMeRouter.get("/", validate(adminMeSchema), adminMeController);