// src/admin/validators/books.validator.js
import { z } from "zod";

const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine((n) => Number.isInteger(n) && n >= 1, "page must be an integer >= 1"),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 100, "limit must be 1..100"),
});

const dateSchema = z
  .string()
  .optional()
  .refine(
    (v) => !v || /^\d{2}-\d{2}-\d{4}$/.test(v),
    "date must be DD-MM-YYYY"
  );

const filterSchema = z
  .string()
  .optional()
  .transform((v) => v ?? "all")
  .refine((v) => ["all", "best_seller", "new_arrival"].includes(v), "invalid filter");

export const adminBookCategoriesSchema = z.object({
  query: z.object({}).optional(),
});

export const adminListBooksSchema = z.object({
  query: z
    .object({
      search: z.string().optional().transform((v) => v?.trim()),
      filter: filterSchema,
      from_date: dateSchema,
      to_date: dateSchema,
      page: paginationSchema.shape.page,
      limit: paginationSchema.shape.limit,
    })
    .refine(
      (q) => !q.from_date || !q.to_date || true,
      { message: "Invalid date range" }
    ),
});

export const adminGetBookSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
});

const bookStatusSchema = z
  .string()
  .optional()
  .refine((v) => !v || ["ACTIVE", "INACTIVE"].includes(v), "status must be ACTIVE|INACTIVE");

const bookTypeSchema = z
  .string()
  .optional()
  .refine((v) => !v || ["HARD_COPY", "EBOOK", "AUDIOBOOK"].includes(v), "type invalid");

const nullableString = (max = 5000) =>
  z.string().max(max).nullable().optional();

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();

const numberLike = () =>
  z.union([z.number(), z.string()]).transform((v) => Number(v));

export const adminCreateBookSchema = z.object({
  body: z
    .object({
      // required
      name: z.string().min(1).max(250),
      author: z.string().min(1).max(250),
      category: z.string().min(1, "category is required"), // categoryId
      type: bookTypeSchema.default("HARD_COPY"),
      price: numberLike().refine((n) => !Number.isNaN(n) && n >= 0, "price invalid"),

      // optional
      malayalam_name: nullableString(250),
      author_malayalam: nullableString(250),
      best_seller: z.boolean().optional().default(false),
      description: nullableString(5000),
      edition: nullableString(100),
      isbn: nullableString(50),
      num_of_pages: nullableString(50),
      publisher: nullableString(250),
      language: nullableString(50),
      discount: z.string().nullable().optional(), // discountId
      status: bookStatusSchema.default("ACTIVE"),
      award_winner: z.boolean().optional().default(false),
      new_arrival: z.boolean().optional().default(false),
      republication: z.boolean().optional().default(false),
      highlight: z.boolean().optional().default(false),
      rank: nullableString(50),
      unlimited_stock: z.boolean().optional().default(false),
      stock: z.union([z.number().int(), z.string()]).optional().transform((v) => (v === undefined ? 0 : Number(v))),
      cover_image_url: nullableUrl(),
    })
    .strict(),
});

export const adminUpdateBookSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
  body: z
    .object({
      name: z.string().min(1).max(250).optional(),
      author: z.string().min(1).max(250).optional(),
      category: z.string().min(1).optional(),
      type: bookTypeSchema.optional(),
      price: z.union([z.number(), z.string()]).optional().transform((v) => (v === undefined ? undefined : Number(v))),

      malayalam_name: nullableString(250),
      author_malayalam: nullableString(250),
      best_seller: z.boolean().optional(),
      description: nullableString(5000),
      edition: nullableString(100),
      isbn: nullableString(50),
      num_of_pages: nullableString(50),
      publisher: nullableString(250),
      language: nullableString(50),
      discount: z.string().nullable().optional(),
      status: bookStatusSchema.optional(),
      award_winner: z.boolean().optional(),
      new_arrival: z.boolean().optional(),
      republication: z.boolean().optional(),
      highlight: z.boolean().optional(),
      rank: nullableString(50),
      unlimited_stock: z.boolean().optional(),
      stock: z.union([z.number().int(), z.string()]).optional().transform((v) => (v === undefined ? undefined : Number(v))),
      cover_image_url: nullableUrl(),
    })
    .strict()
    .refine((b) => Object.keys(b).length > 0, "At least one field must be provided"),
});

export const adminDeleteBookSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
});