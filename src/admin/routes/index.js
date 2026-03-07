// src/admin/routes/index.js
import { Router } from "express";
import { adminMeRouter } from "./me.routes.js";
import { adminDashboardRouter } from "./dashboard.routes.js";
import { adminBooksRouter } from "./books.routes.js";
import { adminOrdersRouter } from "./orders.routes.js";
import { adminCustomersRouter } from "./customers.routes.js";
import { adminOffersRouter } from "./offers.routes.js";
import { adminCategoriesRouter } from "./categories.routes.js";
import { adminRulesRouter } from "./rules.routes.js";
import { adminEventsRouter } from "./events.routes.js";
import { adminAdsRouter } from "./ads.routes.js";
import { adminAwardsRouter } from "./awards.routes.js";
import { adminDownloadsRouter } from "./downloads.routes.js";

export const adminRouter = Router();

adminRouter.use("/me", adminMeRouter);
adminRouter.use("/dashboard", adminDashboardRouter);
adminRouter.use("/book", adminBooksRouter);
adminRouter.use("/categories", adminCategoriesRouter);
adminRouter.use("/orders", adminOrdersRouter);
adminRouter.use("/customers", adminCustomersRouter);
adminRouter.use("/offers", adminOffersRouter);
adminRouter.use("/rules", adminRulesRouter);
adminRouter.use("/events", adminEventsRouter);
adminRouter.use("/ads", adminAdsRouter);
adminRouter.use("/awards", adminAwardsRouter);
adminRouter.use("/downloads", adminDownloadsRouter);
