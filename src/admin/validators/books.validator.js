// src/admin/validators/books.validator.js
import { z } from "zod";

/**
 * ---------------------------------------------------------
 * Shared helpers
 * ---------------------------------------------------------
 */

const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine(
      (n) => Number.isInteger(n) && n >= 1,
      "page must be an integer >= 1",
    ),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .refine(
      (n) => Number.isInteger(n) && n >= 1 && n <= 100,
      "limit must be 1..100",
    ),
});

function parseDDMMYYYY(value) {
  if (!value || typeof value !== "string") return null;

  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, dd, mm, yyyy] = match;

  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

const dateSchema = z
  .string()
  .optional()
  .refine(
    (v) => !v || /^\d{2}-\d{2}-\d{4}$/.test(v),
    "date must be DD-MM-YYYY",
  );

const filterSchema = z
  .string()
  .optional()
  .transform((v) => v ?? "all")
  .refine(
    (v) => ["all", "best_seller", "new_arrival"].includes(v),
    "invalid filter",
  );

const optionalTrimmedString = (max) =>
  z.preprocess((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== "string") return v;

    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  }, z.string().max(max).nullable().optional());

const optionalCuid = () =>
  z.preprocess((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== "string") return v;

    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  }, z.string().cuid().nullable().optional());

const nullableString = (max = 5000) =>
  z.preprocess((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== "string") return v;

    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  }, z.string().max(max).nullable().optional());

const nullableUrl = () =>
  z.preprocess((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== "string") return v;

    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  }, z.string().url("must be a valid URL").nullable().optional());

const numberLike = () =>
  z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return undefined;
    return Number(v);
  }, z.number());

const intLike = (defaultValue = 0) =>
  z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return defaultValue;
    return Number(v);
  }, z.number().int());

const booleanLike = (defaultValue = false) =>
  z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return defaultValue;
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v.trim().toLowerCase() === "true";
    return defaultValue;
  }, z.boolean());

const bookStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const bookTypeSchema = z.enum(["HARD_COPY", "EBOOK", "AUDIO_BOOK"]);

/**
 * ---------------------------------------------------------
 * Book categories
 * ---------------------------------------------------------
 */

export const adminBookCategoriesSchema = z.object({
  query: z.object({}).optional(),
});

/**
 * ---------------------------------------------------------
 * Categories
 * ---------------------------------------------------------
 */

export const adminCreateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "name is required"),
  }),
});

export const adminListCategoriesSchema = z.object({
  query: z.object({
    search: z
      .string()
      .optional()
      .transform((v) => {
        const value = v?.trim();
        return value ? value : undefined;
      }),
    page: paginationSchema.shape.page.optional(),
    limit: paginationSchema.shape.limit.optional(),
  }),
});

export const adminUpdateCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, "categoryId is required"),
  }),
  body: z.object({
    name: z.string().trim().min(1, "name is required"),
  }),
});

export const adminDeleteCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, "categoryId is required"),
  }),
});

/**
 * ---------------------------------------------------------
 * Books
 * ---------------------------------------------------------
 */

export const adminListBooksSchema = z.object({
  query: z
    .object({
      search: z
        .string()
        .optional()
        .transform((v) => {
          const value = v?.trim();
          return value ? value : undefined;
        }),
      filter: filterSchema.optional().default("all"),
      from_date: dateSchema.optional(),
      to_date: dateSchema.optional(),
      page: paginationSchema.shape.page.optional(),
      category: z.string().cuid("Invalid category").optional(),
      limit: paginationSchema.shape.limit.optional(),
    })
    .superRefine((q, ctx) => {
      if (!q.from_date || !q.to_date) return;

      const from = parseDDMMYYYY(q.from_date);
      const to = parseDDMMYYYY(q.to_date);

      if (!from || !to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to_date"],
          message: "Invalid date format. Use DD-MM-YYYY",
        });
        return;
      }

      if (from > to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to_date"],
          message: "from_date must be less than or equal to to_date",
        });
      }
    }),
});

export const adminGetBookSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
});

export const adminCreateBookSchema = z.object({
  body: z
    .object({
      // required
      name: z.string().trim().min(1, "name is required").max(250),
      author: z.string().trim().min(1, "author is required").max(250),
      category: z.string().trim().min(1, "category is required").max(250),
      type: bookTypeSchema.default("HARD_COPY"),
      price: numberLike().refine(
        (n) => !Number.isNaN(n) && n >= 0,
        "price invalid",
      ),

      // optional
      malayalam_name: nullableString(250),
      author_malayalam: nullableString(250),
      best_seller: booleanLike(false).default(false),
      description: nullableString(5000),
      edition: nullableString(100),
      isbn: nullableString(50),
      num_of_pages: nullableString(50),
      publisher: nullableString(250),
      language: nullableString(50),

      // allow empty string => null, or id string
      discount: nullableString(100),

      status: bookStatusSchema.default("ACTIVE"),
      award_winner: booleanLike(false).default(false),
      new_arrival: booleanLike(false).default(false),
      republication: booleanLike(false).default(false),
      highlight: booleanLike(false).default(false),
      rank: nullableString(50),
      unlimited_stock: booleanLike(false).default(false),
      stock: intLike(0)
        .refine((n) => n >= 0, "stock must be >= 0")
        .default(0),
      cover_image_url: nullableUrl(),
    })
    .strict(),
});

export const adminUpdateBookSchema = z.object({
  params: z.object({
    bookId: z.string().cuid("Invalid bookId"),
  }),

  body: z
    .object({
      name: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v !== "string") return v;
        return v.trim();
      }, z.string().min(1, "name is required").max(250).optional()),

      author: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v !== "string") return v;
        return v.trim();
      }, z.string().min(1, "author is required").max(250).optional()),

      category: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v !== "string") return v;
        return v.trim();
      }, z.string().trim().min(1, "category is required").max(250).optional()),

      type: z.preprocess((v) => {
        if (v === undefined || v === null || v === "") return undefined;
        return v;
      }, bookTypeSchema.optional()),

      price: z.preprocess((v) => {
        if (v === undefined || v === null || v === "") return undefined;
        return Number(v);
      }, z.number().finite().nonnegative().optional()),

      malayalam_name: optionalTrimmedString(250),
      author_malayalam: optionalTrimmedString(250),
      best_seller: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.trim().toLowerCase() === "true";
        return v;
      }, z.boolean().optional()),
      description: optionalTrimmedString(5000),
      edition: optionalTrimmedString(100),
      isbn: optionalTrimmedString(50),
      num_of_pages: optionalTrimmedString(50),
      publisher: optionalTrimmedString(250),
      language: optionalTrimmedString(50),

      discount: optionalCuid(),

      status: z.preprocess((v) => {
        if (v === undefined || v === null || v === "") return undefined;
        return v;
      }, bookStatusSchema.optional()),

      award_winner: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.trim().toLowerCase() === "true";
        return v;
      }, z.boolean().optional()),

      new_arrival: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.trim().toLowerCase() === "true";
        return v;
      }, z.boolean().optional()),

      republication: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.trim().toLowerCase() === "true";
        return v;
      }, z.boolean().optional()),

      highlight: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.trim().toLowerCase() === "true";
        return v;
      }, z.boolean().optional()),

      rank: optionalTrimmedString(50),

      unlimited_stock: z.preprocess((v) => {
        if (v === undefined) return undefined;
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.trim().toLowerCase() === "true";
        return v;
      }, z.boolean().optional()),

      stock: z.preprocess((v) => {
        if (v === undefined || v === null || v === "") return undefined;
        return Number(v);
      }, z.number().int().min(0).optional()),

      cover_image_url: nullableUrl(),
    })
    .strict()
    .refine((b) => Object.keys(b).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const adminDeleteBookSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
});

export const adminExportBooksCsvSchema = z.object({
  query: z
    .object({
      search: z
        .string()
        .optional()
        .transform((v) => {
          const value = v?.trim();
          return value ? value : undefined;
        }),
      filter: filterSchema.optional().default("all"),
      from_date: dateSchema.optional(),
      to_date: dateSchema.optional(),
      category: z.string().cuid("Invalid category").optional(),
    })
    .superRefine((q, ctx) => {
      if (!q.from_date || !q.to_date) return;

      const from = parseDDMMYYYY(q.from_date);
      const to = parseDDMMYYYY(q.to_date);

      if (!from || !to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to_date"],
          message: "Invalid date format. Use DD-MM-YYYY",
        });
        return;
      }

      if (from > to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to_date"],
          message: "from_date must be less than or equal to to_date",
        });
      }
    }),
});
