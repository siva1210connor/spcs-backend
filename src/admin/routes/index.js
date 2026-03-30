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
import { adminCatalogueRouter } from "./catalogue.routes.js";
import { adminArchivesRouter } from "./archives.routes.js";
import { adminBulletinRouter } from "./bulletin.routes.js";
import { adminFeedbackRouter } from "./feedback.routes.js";
import { adminReviewsRouter } from "./reviews.routes.js";
import { adminSchemeRouter } from "./scheme.routes.js";
import { adminGalleryRouter } from "./gallery.routes.js";
import { adminAuditLogsRouter } from "./audit-logs.routes.js";

export const adminRouter = Router();

adminRouter.use("/me", adminMeRouter); //done
adminRouter.use("/dashboard", adminDashboardRouter); // done
adminRouter.use("/books", adminBooksRouter); //done
adminRouter.use("/categories", adminCategoriesRouter); //done
adminRouter.use("/orders", adminOrdersRouter); //done
adminRouter.use("/customers", adminCustomersRouter); //done
adminRouter.use("/offers", adminOffersRouter); //done
adminRouter.use("/rules", adminRulesRouter);
adminRouter.use("/events", adminEventsRouter);
adminRouter.use("/ads", adminAdsRouter);
adminRouter.use("/awards", adminAwardsRouter); //done
adminRouter.use("/downloads", adminDownloadsRouter); //done
adminRouter.use("/catalogue", adminCatalogueRouter); //done
adminRouter.use("/archives", adminArchivesRouter);
adminRouter.use("/bulletin", adminBulletinRouter); // done
adminRouter.use("/feedback", adminFeedbackRouter);
adminRouter.use("/reviews", adminReviewsRouter); //done 
adminRouter.use("/scheme", adminSchemeRouter);//done
adminRouter.use("/gallery", adminGalleryRouter);
adminRouter.use("/audit-logs", adminAuditLogsRouter);
