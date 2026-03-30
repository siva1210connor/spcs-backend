import { Router } from "express";
import {
  adminOffersListController,
  adminCreateOfferController,
  adminOfferDeleteController,
  adminOfferUpdateController
} from "../controllers/offers.controller.js";

import { validate } from "../../middleware/validate.middleware.js";
import {


  adminCreateOfferSchema,
  deleteOfferSchema,
  listOffersSchema,

  updateOfferSchema
} from "../validators/offers.validator.js";
import { offerUpload } from '../../middleware/upload.js'
export const adminOffersRouter = Router();

adminOffersRouter.get("/", validate(listOffersSchema), adminOffersListController);
adminOffersRouter.post(
  "/",
  offerUpload.single("image"),
  validate(adminCreateOfferSchema),
  adminCreateOfferController
);
adminOffersRouter.put(
  "/:offerId",
  offerUpload.single("image"),
  validate(updateOfferSchema),
  adminOfferUpdateController
);

adminOffersRouter.delete("/:offerId", validate(deleteOfferSchema), adminOfferDeleteController);
