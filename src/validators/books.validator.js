import { z } from "zod";

/**
 * Common pagination schema
 */
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
    .refine(
      (n) => Number.isInteger(n) && n >= 1 && n <= 100,
      "limit must be an integer between 1 and 100"
    ),
});

/**
 * Sort options for books list
 */
const sortSchema = z
  .string()
  .optional()
  .transform((v) => v ?? "latest")
  .refine(
    (v) => ["latest", "price_asc", "price_desc", "rank_asc", "rank_desc"].includes(v),
    "sort must be one of latest | price_asc | price_desc | rank_asc | rank_desc"
  );

/**
 * BookType enum for query usage
 */
const bookTypeSchema = z
  .string()
  .optional()
  .refine(
    (v) => !v || ["HARD_COPY", "EBOOK", "AUDIOBOOK"].includes(v),
    "type must be one of HARD_COPY | EBOOK | AUDIOBOOK"
  );

/**
 * Boolean-ish query parsing: "true"/"false"
 */
const booleanQuerySchema = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === "true") return true;
    if (v === "false") return false;
    return v; // will fail refine
  })
  .refine((v) => v === undefined || typeof v === "boolean", "must be true or false");

/**
 * Price parsing
 */
const priceQuerySchema = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : undefined))
  .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), "must be a number >= 0");

/**
 * GET /books query schema
 */
export const listBooksSchema = z.object({
  query: z
    .object({
      search: z.string().optional().transform((v) => v?.trim()).refine((v) => !v || v.length <= 100, "search too long"),
      categoryId: z.string().optional(),
      type: bookTypeSchema,
      best_seller: booleanQuerySchema,
      new_arrival: booleanQuerySchema,
      language: z.string().optional().transform((v) => v?.trim()).refine((v) => !v || v.length <= 50, "language too long"),
      minPrice: priceQuerySchema,
      maxPrice: priceQuerySchema,
      sort: sortSchema,
      page: paginationSchema.shape.page,
      limit: paginationSchema.shape.limit,
    })
    .refine(
      (q) =>
        q.minPrice === undefined ||
        q.maxPrice === undefined ||
        (typeof q.minPrice === "number" &&
          typeof q.maxPrice === "number" &&
          q.maxPrice >= q.minPrice),
      {
        message: "maxPrice must be >= minPrice",
        path: ["maxPrice"],
      }
    ),
});

/**
 * GET /books/:bookId params schema
 */
export const getBookSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
});