// src/admin/controllers/books.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListCategories,
  adminListBooks,
  adminGetBook,
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
} from "../services/books.service.js";

export const adminBookCategoriesController = asyncHandler(async (req, res) => {
  const items = await adminListCategories();
  return ok(res, items, "Categories fetched");
});

export const adminBookListController = asyncHandler(async (req, res) => {
  const result = await adminListBooks({ query: req.validated.query });
  return ok(res, result, "Books fetched");
});

export const adminBookGetController = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;
  const book = await adminGetBook({ bookId });
  return ok(res, book, "Book fetched");
});

export const adminBookCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateBook({ req,body: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminBookUpdateController = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;
  const data = await adminUpdateBook({ req,bookId, body: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminBookDeleteController = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;
  const data = await adminDeleteBook({ req,bookId });
  return ok(res, data, data.msg);
});