// src/admin/routes/rules.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListRulesSchema,
  adminCreateRuleSchema,
  adminUpdateRuleSchema,
  adminDeleteRuleSchema,
} from "../validators/rules.validator.js";
import {
  adminRulesListController,
  adminRulesCreateController,
  adminRulesUpdateController,
  adminRulesDeleteController,
} from "../controllers/rules.controller.js";

export const adminRulesRouter = Router();

/**
 * Base: {{base_url}}/admin/rules
 */

adminRulesRouter.get("/", validate(adminListRulesSchema), adminRulesListController);
adminRulesRouter.post("/", validate(adminCreateRuleSchema), adminRulesCreateController);
adminRulesRouter.put("/:ruleId", validate(adminUpdateRuleSchema), adminRulesUpdateController);
adminRulesRouter.delete("/:ruleId", validate(adminDeleteRuleSchema), adminRulesDeleteController);