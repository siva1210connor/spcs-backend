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
  adminExportBooksCsv,
} from "../services/books.service.js";

// Categories
export const adminCreateCategoryController = asyncHandler(async (req, res) => {
  const data = await adminCreateCategory({ body: req.validated.body });
  return ok(res, data, "Category created");
});
export const adminBookCategoriesController = asyncHandler(async (req, res) => {
  const data = await adminListCategories({ query: req.validated.query });
  return ok(res, data, "Categories fetched");
});

export const adminUpdateCategoryController = asyncHandler(async (req, res) => {
  const data = await adminUpdateCategory({
    categoryId: req.validated.params.categoryId,
    body: req.validated.body,
  });

  return ok(res, data, "Category updated");
});

export const adminDeleteCategoryController = asyncHandler(async (req, res) => {
  const data = await adminDeleteCategory({
    categoryId: req.validated.params.categoryId,
  });

  return ok(res, data, "Category deleted");
});

// Books
export const adminBookListController = asyncHandler(async (req, res) => {
  const result = await adminListBooks({ query: req.validated.query });
  return ok(res, result, "Books fetched");
});

export const adminBookGetController = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;
  const book = await adminGetBook({ req,bookId });
  return ok(res, book, "Book fetched");
});

export const adminBookCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateBook({ req, body: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminBookUpdateController = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;
  const data = await adminUpdateBook({ req, bookId, body: req.validated.body });
  return ok(res, data, data.msg);
});

export const adminBookDeleteController = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;
  const data = await adminDeleteBook({ req, bookId });
  return ok(res, data, data.msg);
});

export const adminExportBooksCsvController = asyncHandler(async (req, res) => {
  const csv = await adminExportBooksCsv({ query: req.validated.query });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="books.csv"');

  return res.status(200).send(csv);
});