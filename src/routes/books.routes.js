// src/routes/books.routes.js
import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { listBooksSchema, getBookSchema } from "../validators/books.validator.js";
import { listBooksController, getBookController } from "../controllers/books.controller.js";

export const booksRouter = Router();

/**
 * Public routes
 * Base path: /api/books
 */

// List books with filters + pagination
booksRouter.get("/", validate(listBooksSchema), listBooksController);

// Get book details
booksRouter.get("/:bookId", validate(getBookSchema), getBookController);