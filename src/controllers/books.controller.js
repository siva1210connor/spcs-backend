// src/controllers/books.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { listBooks, getBookById } from "../services/books.service.js";

/**
 * GET /api/books
 * Query params validated by listBooksSchema
 */
export const listBooksController = asyncHandler(async (req, res) => {
  const { query } = req.validated;

  const result = await listBooks({ query });

  return ok(
    res,
    {
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    "Books fetched successfully"
  );
});

/**
 * GET /api/books/:bookId
 * Params validated by getBookSchema
 */
export const getBookController = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;

  const book = await getBookById({ bookId });

  return ok(res, book, "Book fetched successfully");
});