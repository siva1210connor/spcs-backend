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
} from "../validators/books.validator.js";
import {
  adminBookCategoriesController,
  adminBookListController,
  adminBookGetController,
  adminBookCreateController,
  adminBookUpdateController,
  adminBookDeleteController,
} from "../controllers/books.controller.js";

export const adminBooksRouter = Router();

/**
 * Base path: /api/admin/book
 */


// categories
adminBooksRouter.get("/categories", validate(adminBookCategoriesSchema), adminBookCategoriesController);

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