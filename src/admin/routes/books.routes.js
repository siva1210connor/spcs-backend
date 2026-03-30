// src/admin/routes/books.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminBookCategoriesSchema,
  adminListBooksSchema,
  adminGetBookSchema,
  adminCreateBookSchema,
  adminUpdateBookSchema,
  adminDeleteBookSchema,

  // Category
  adminListCategoriesSchema,
  adminUpdateCategorySchema,
  adminDeleteCategorySchema,
  adminCreateCategorySchema,




  // Export
  adminExportBooksCsvSchema
} from "../validators/books.validator.js";
import {
  adminBookCategoriesController,
  adminBookListController,
  adminBookGetController,
  adminBookCreateController,
  adminBookUpdateController,
  adminBookDeleteController,
  // Category
  adminUpdateCategoryController,
  adminDeleteCategoryController,
  adminCreateCategoryController,

  adminExportBooksCsvController
} from "../controllers/books.controller.js";

export const adminBooksRouter = Router();

/**
 * Base path: /api/admin/book
 */

// list books
adminBooksRouter.get("/", validate(adminListBooksSchema), adminBookListController);
// get book details
adminBooksRouter.get("/:bookId", validate(adminGetBookSchema), adminBookGetController);

// create book
adminBooksRouter.post("/", validate(adminCreateBookSchema), adminBookCreateController);

// update book
adminBooksRouter.put("/:bookId", validate(adminUpdateBookSchema), adminBookUpdateController);

// delete book
adminBooksRouter.delete("/:bookId", validate(adminDeleteBookSchema), adminBookDeleteController);

// export as csv
adminBooksRouter.get(
  "/export/csv",
  validate(adminExportBooksCsvSchema),
  adminExportBooksCsvController
);