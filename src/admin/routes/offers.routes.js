import { Router } from "express";
import {
  adminOffersListController,
  adminOffersUpsertController,
  adminOfferDeleteController,
} from "../controllers/offers.controller.js";

import { validate } from "../../middleware/validate.middleware.js";
import {
  upsertOffersSchema,
  deleteOfferSchema,
  listOffersSchema,
} from "../validators/offers.validator.js";

export const adminOffersRouter = Router();

adminOffersRouter.get("/", validate(listOffersSchema), adminOffersListController);

adminOffersRouter.put("/", validate(upsertOffersSchema), adminOffersUpsertController);

adminOffersRouter.delete("/:offerId", validate(deleteOfferSchema), adminOfferDeleteController);
