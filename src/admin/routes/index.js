// src/admin/routes/index.js
import { Router } from "express";
import { adminMeRouter } from "./me.routes.js";
import { adminDashboardRouter } from "./dashboard.routes.js";
import { adminBooksRouter } from "./books.routes.js";
import { adminOrdersRouter } from "./orders.routes.js";

export const adminRouter = Router();

adminRouter.use("/me", adminMeRouter);
adminRouter.use("/dashboard", adminDashboardRouter);
adminRouter.use("/book", adminBooksRouter);
adminRouter.use("/orders", adminOrdersRouter);