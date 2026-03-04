import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { booksRouter } from "./books.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { adminRouter } from "../admin/routes/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
// import { cartRouter } from "./cart.routes.js";
// import { wishlistRouter } from "./wishlist.routes.js";
// import { requireAuth } from "../middleware/auth.middleware.js";

export const apiRouter = Router();

// Admin routes
apiRouter.use("/admin", requireAuth, requireAdmin, adminRouter);


apiRouter.use("/health", healthRouter);
apiRouter.use("/user/auth", authRouter);

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/books", booksRouter);

//apiRouter.use("/cart", requireAuth, cartRouter);
//apiRouter.use("/wishlist", requireAuth, wishlistRouter);