// src/admin/services/books.service.js
import { prisma } from "../../config/prisma.js";
import { createAdminAuditLog } from "../../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../../audit/audit.constants.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) {
    console.error("SERVICE ERROR:", {
      code,
      message,
      cause,
    });
  }

  return err;
}
export function parseDDMMYYYY(value) {
  if (!value || typeof value !== "string") return null;

  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, dd, mm, yyyy] = match;

  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  const date = new Date(year, month - 1, day);

  // strict validation
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function buildBookWhere({ search, filter, from_date, to_date, category }) {
  const and = [];

  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { isbn: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (filter === "best_seller") {
    and.push({ bestSeller: true });
  }

  if (filter === "new_arrival") {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    and.push({
      createdAt: {
        gte: sixtyDaysAgo,
      },
    });
  }

  if (category) {
    and.push({ categoryId: category });
  }

  const from = parseDDMMYYYY(from_date);
  const to = parseDDMMYYYY(to_date);

  if (from || to) {
    const createdAt = {};

    if (from) {
      from.setHours(0, 0, 0, 0);
      createdAt.gte = from;
    }

    if (to) {
      to.setHours(23, 59, 59, 999);
      createdAt.lte = to;
    }

    and.push({ createdAt });
  }

  return and.length ? { AND: and } : {};
}

function mapCreateBodyToData(body) {
  // map snake_case -> camelCase (Prisma)
  const data = {
    name: body.name,
    author: body.author,
    categoryId: body.category,
    type: body.type ?? "HARD_COPY",
    price: body.price ? Number(body.price) : 0,

    malayalamName: body.malayalam_name ?? null,
    authorMalayalam: body.author_malayalam ?? null,
    bestSeller: body.best_seller ?? false,
    description: body.description ?? null,
    edition: body.edition ?? null,
    isbn: body.isbn ?? null,
    numOfPages: body.num_of_pages ?? null,
    publisher: body.publisher ?? null,
    language: body.language ?? null,
    status: body.status ?? "ACTIVE",
    awardWinner: body.award_winner ?? false,
    newArrival: body.new_arrival ?? false,
    republication: body.republication ?? false,
    highlight: body.highlight ?? false,
    rank: body.rank ?? null,
    unlimitedStock: body.unlimited_stock ?? false,
    stock: body.unlimited_stock ? 0 : (body.stock ?? 0),
    coverImageUrl: body.cover_image_url ?? null,

    discountId: body.discount ?? null,
  };

  // If unlimited stock, stock can be ignored but we keep it.
  return data;
}
function mapUpdateBodyToData(body, existing) {
  const data = {};

  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (body.name !== undefined) data.name = body.name;
  if (body.author !== undefined) data.author = body.author;
  if (body.category !== undefined) data.categoryId = body.category;
  if (body.type !== undefined) data.type = body.type;
  if (body.price !== undefined) data.price = body.price;

  if (has("malayalam_name")) data.malayalamName = body.malayalam_name;
  if (has("author_malayalam")) data.authorMalayalam = body.author_malayalam;
  if (body.best_seller !== undefined) data.bestSeller = body.best_seller;
  if (has("description")) data.description = body.description;
  if (has("edition")) data.edition = body.edition;
  if (has("isbn")) data.isbn = body.isbn;
  if (has("num_of_pages")) data.numOfPages = body.num_of_pages;
  if (has("publisher")) data.publisher = body.publisher;
  if (has("language")) data.language = body.language;
  if (has("discount")) data.discountId = body.discount; // can be null
  if (body.status !== undefined) data.status = body.status;
  if (body.award_winner !== undefined) data.awardWinner = body.award_winner;
  if (body.new_arrival !== undefined) data.newArrival = body.new_arrival;
  if (body.republication !== undefined) data.republication = body.republication;
  if (body.highlight !== undefined) data.highlight = body.highlight;
  if (has("rank")) data.rank = body.rank;
  if (has("cover_image_url")) data.coverImageUrl = body.cover_image_url;

  const nextUnlimitedStock =
    body.unlimited_stock !== undefined
      ? body.unlimited_stock
      : existing.unlimitedStock;

  if (body.unlimited_stock !== undefined) {
    data.unlimitedStock = body.unlimited_stock;

    if (body.unlimited_stock === true) {
      data.stock = 0;
    }
  }

  if (body.stock !== undefined) {
    if (nextUnlimitedStock) {
      throw makeError(
        "Stock cannot be set when unlimited_stock is true",
        400,
        "ADMIN_BOOK_INVALID_STOCK_UPDATE"
      );
    }

    data.stock = body.stock;
  }

  return data;
}

// Categories
export async function adminCreateCategory({ body }) {
  try {
    const existing = await prisma.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw makeError(
        "Category already exists",
        409,
        "ADMIN_CATEGORY_ALREADY_EXISTS"
      );
    }

    const created = await prisma.category.create({
      data: {
        name: body.name,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return {
      category_id: created.id,
      name: created.name,
      created_at: created.createdAt,
    };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    if (err?.code === "P2002") {
      throw makeError(
        "Category already exists",
        409,
        "ADMIN_CATEGORY_ALREADY_EXISTS",
        err
      );
    }

    throw makeError(
      "Failed to create category",
      500,
      "ADMIN_CATEGORY_CREATE_FAILED",
      err
    );
  }
}
export async function adminListCategories({ query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: "insensitive",
      };
    }

    const [total, items] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              books: true,
            },
          },
        },
      }),
    ]);

    return {
      items: items.map((c) => ({
        category_id: c.id,
        name: c.name,
        books_count: c._count.books,
        created_at: c.createdAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError(
      "Failed to list categories",
      500,
      "ADMIN_CATEGORIES_LIST_FAILED",
      err,
    );
  }
}
export async function adminUpdateCategory({ categoryId, body }) {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true },
    });

    if (!existing) {
      throw makeError("Category not found", 404, "ADMIN_CATEGORY_NOT_FOUND");
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
        NOT: {
          id: categoryId,
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw makeError("Category name already exists", 409, "ADMIN_CATEGORY_NAME_EXISTS");
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    });

    return {
      category_id: updated.id,
      name: updated.name,
      updated_at: updated.updatedAt,
    };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    if (err?.code === "P2025") {
      throw makeError("Category not found", 404, "ADMIN_CATEGORY_NOT_FOUND", err);
    }

    if (err?.code === "P2002") {
      throw makeError("Category name already exists", 409, "ADMIN_CATEGORY_NAME_EXISTS", err);
    }

    throw makeError(
      "Failed to update category",
      500,
      "ADMIN_CATEGORY_UPDATE_FAILED",
      err,
    );
  }
}
export async function adminDeleteCategory({ categoryId }) {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        _count: {
          select: { books: true },
        },
      },
    });

    if (!existing) {
      throw makeError("Category not found", 404, "ADMIN_CATEGORY_NOT_FOUND");
    }

    if (existing._count.books > 0) {
      throw makeError(
        "Cannot delete category with linked books",
        400,
        "ADMIN_CATEGORY_HAS_BOOKS"
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    if (err?.code === "P2025") {
      throw makeError("Category not found", 404, "ADMIN_CATEGORY_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to delete category",
      500,
      "ADMIN_CATEGORY_DELETE_FAILED",
      err,
    );
  }
}

export async function adminListBooks({ query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = buildBookWhere(query);

    const [total, items] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          coverImageUrl: true,
          bestSeller: true,
          name: true,
          author: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      items: items.map((b) => ({
        book_id: b.id,
        cover_image_url: b.coverImageUrl ?? null,
        best_seller: b.bestSeller,
        name: b.name,
        author: b.author,
        created_at: b.createdAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError(
      "Failed to list books",
      500,
      "ADMIN_BOOKS_LIST_FAILED",
      err,
    );
  }
}

export async function adminGetBook({ bookId }) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        name: true,
        author: true,
        category: { select: { id: true, name: true } },
        edition: true,
        price: true,
        discountId: true,
        coverImageUrl: true,
        awardWinner: true,
        bestSeller: true,
        stock: true,
        unlimitedStock: true,
        status: true,
        type: true,
        language: true,
        isbn: true,
        publisher: true,
        numOfPages: true,
        description: true,
        newArrival: true,
        republication: true,
        highlight: true,
        rank: true,
        malayalamName: true,
        authorMalayalam: true,
      },
    });

    if (!book) throw makeError("Book not found", 404, "ADMIN_BOOK_NOT_FOUND");
    await createAdminAuditLog({
      req,
      action: "VIEW",
      resourceType: AUDIT_RESOURCE_TYPES.BOOK,
      resourceId: book.id,
      message: "Book viewed",
      beforeJson: null,
      afterJson: {
        book_id: book.id,
        name: book.name,
      },
    });
    // Match your spec response shape
    return {
      book_id: book.id,
      name: book.name,
      author: book.author,
      category: book.category?.id ?? null,
      category_name: book.category?.name ?? null,
      edition: book.edition ?? null,
      price: book.price ? Number(book.price) : 0,
      discount: book.discountId ?? null,
      cover_image_url: book.coverImageUrl ?? null,
      award_winner: book.awardWinner,
      best_seller: book.bestSeller,
      stock: book.stock,
      unlimited_stock: book.unlimitedStock,
      status: book.status,
      type: book.type,
      language: book.language ?? null,
      isbn: book.isbn ?? null,
      publisher: book.publisher ?? null,
      num_of_pages: book.numOfPages ?? null,
      description: book.description ?? null,
      new_arrival: book.newArrival,
      republication: book.republication,
      highlight: book.highlight,
      rank: book.rank ?? null,
      malayalam_name: book.malayalamName ?? null,
      author_malayalam: book.authorMalayalam ?? null,
    };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to fetch book",
      500,
      "ADMIN_BOOK_FETCH_FAILED",
      err,
    );
  }
}

export async function adminCreateBook({ req, body }) {
  try {


    // Validate category
    const category = await prisma.category.findUnique({
      where: { id: body.category },
      select: { id: true },
    });

    if (!category) {
      throw makeError("Category not found", 404, "ADMIN_CATEGORY_NOT_FOUND");
    }

    // Validate discount
    if (body.discount) {
      const discount = await prisma.discount.findUnique({
        where: { id: body.discount },
        select: { id: true },
      });

      if (!discount) {
        throw makeError("Discount not found", 404, "ADMIN_DISCOUNT_NOT_FOUND");
      }
    }

    // Check duplicate ISBN
    if (body.isbn) {
      const existing = await prisma.book.findFirst({
        where: { isbn: body.isbn },
        select: { id: true },
      });

      if (existing) {
        throw makeError("ISBN already exists", 409, "ADMIN_BOOK_ISBN_EXISTS");
      }
    }

    const data = mapCreateBodyToData({
      ...body,
      price: Number(body.price),
    });

    const created = await prisma.book.create({
      data,
      select: { id: true, name: true },
    });

    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.BOOK,
      resourceId: created.id,
      message: "Book created",
      beforeJson: null,
      afterJson: {
        book_id: created.id,
        ...body,
      },
    });

    return {
      book_id: created.id,
      name: created.name,
    };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    throw makeError(
      "Failed to create book",
      500,
      "ADMIN_BOOK_CREATE_FAILED",
      err,
    );
  }
}


export async function adminUpdateBook({ req, bookId, body }) {
  try {
    // Ensure book exists
    const existing = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        name: true,
        malayalamName: true,
        author: true,
        authorMalayalam: true,
        type: true,
        bestSeller: true,
        newArrival: true,
        awardWinner: true,
        republication: true,
        highlight: true,
        rank: true,
        description: true,
        edition: true,
        isbn: true,
        numOfPages: true,
        publisher: true,
        language: true,
        price: true,
        status: true,
        unlimitedStock: true,
        stock: true,
        coverImageUrl: true,
        categoryId: true,
        discountId: true,
      },
    });
    if (!existing)
      throw makeError("Book not found", 404, "ADMIN_BOOK_NOT_FOUND");

    // Validate category/discount if provided
    if (body.category) {
      const category = await prisma.category.findUnique({
        where: { id: body.category },
        select: { id: true },
      });
      if (!category)
        throw makeError("Category not found", 404, "ADMIN_CATEGORY_NOT_FOUND");
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "discount") &&
      body.discount
    ) {
      const discount = await prisma.discount.findUnique({
        where: { id: body.discount },
        select: { id: true },
      });
      if (!discount)
        throw makeError("Discount not found", 404, "ADMIN_DISCOUNT_NOT_FOUND");
    }

    const data = mapUpdateBodyToData(body, existing);

    await prisma.book.update({
      where: { id: bookId },
      data,
      select: { id: true },
    });

    const updatedBook = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        name: true,
        malayalamName: true,
        author: true,
        authorMalayalam: true,
        type: true,
        bestSeller: true,
        newArrival: true,
        awardWinner: true,
        republication: true,
        highlight: true,
        rank: true,
        description: true,
        edition: true,
        isbn: true,
        numOfPages: true,
        publisher: true,
        language: true,
        price: true,
        status: true,
        unlimitedStock: true,
        stock: true,
        coverImageUrl: true,
        categoryId: true,
        discountId: true,
      },
    });

    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.BOOK,
      resourceId: bookId,
      message: "Book updated",
      beforeJson: existing,
      afterJson: updatedBook,
    });

    return { msg: "updated successfully" };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    if (err?.code === "P2025")
      throw makeError("Book not found", 404, "ADMIN_BOOK_NOT_FOUND", err);
    throw makeError(
      "Failed to update book",
      500,
      "ADMIN_BOOK_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteBook({ req, bookId }) {
  try {
    const existing = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        name: true,
        author: true,
        price: true,
        categoryId: true,
        status: true,
      },
    });

    if (!existing) {
      throw makeError("Book not found", 404, "ADMIN_BOOK_NOT_FOUND");
    }
    await prisma.book.delete({ where: { id: bookId } });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.BOOK,
      resourceId: existing.id,
      message: "Book deleted",
      beforeJson: existing,
      afterJson: null,
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    if (err?.code === "P2003") {
      throw makeError(
        "Book cannot be deleted because it is linked to other records",
        400,
        "ADMIN_BOOK_DELETE_CONFLICT",
        err
      );
    }
    if (err?.code === "P2025")
      throw makeError("Book not found", 404, "ADMIN_BOOK_NOT_FOUND", err);
    throw makeError(
      "Failed to delete book",
      500,
      "ADMIN_BOOK_DELETE_FAILED",
      err,
    );
  }
}

export async function adminExportBooksCsv({ query }) {
  try {
    const where = buildBookWhere(query);

    const items = await prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        author: true,
        isbn: true,
        price: true,
        status: true,
        bestSeller: true,
        newArrival: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes('"') || str.includes(",") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Book ID",
      "Title",
      "Author",
      "ISBN",
      "Category",
      "Price",
      "Status",
      "Best Seller",
      "New Arrival",
      "Created At",
    ];

    const rows = items.map((b) => [
      b.id,
      b.name,
      b.author,
      b.isbn ?? "",
      b.category?.name ?? "",
      b.price ?? "",
      b.status ?? "",
      b.bestSeller ? "Yes" : "No",
      b.newArrival ? "Yes" : "No",
      b.createdAt ? b.createdAt.toISOString() : "",
    ]);

    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ];

    return csvLines.join("\n");
  } catch (err) {
    throw makeError(
      "Failed to export books csv",
      500,
      "ADMIN_BOOKS_EXPORT_CSV_FAILED",
      err
    );
  }
}