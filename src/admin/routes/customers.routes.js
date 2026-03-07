// src/admin/routes/customers.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { adminListCustomersSchema } from "../validators/customers.validator.js";
import { adminCustomersListController } from "../controllers/customers.controller.js";

export const adminCustomersRouter = Router();

/**
 * Base: /api/admin/customers
 */
adminCustomersRouter.get("/", validate(adminListCustomersSchema), adminCustomersListController);