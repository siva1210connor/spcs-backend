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

function parseDDMMYYYY(s) {
  if (!s) return null;
  const [dd, mm, yyyy] = s.split("-").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function buildBookWhere({ search, filter, from_date, to_date }) {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
      { isbn: { contains: search, mode: "insensitive" } },
    ];
  }

  if (filter === "best_seller") where.bestSeller = true;
  if (filter === "new_arrival") where.newArrival = true;

  const from = parseDDMMYYYY(from_date);
  const to = parseDDMMYYYY(to_date);

  if (from || to) {
    where.createdAt = {};
    if (from) {
      from.setHours(0, 0, 0, 0);
      where.createdAt.gte = from;
    }
    if (to) {
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  return where;
}

function mapCreateBodyToData(body) {
  // map snake_case -> camelCase (Prisma)
  const data = {
    name: body.name,
    author: body.author,
    categoryId: body.category,
    type: body.type ?? "HARD_COPY",
    price: body.price,

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
    stock: body.stock ?? 0,
    coverImageUrl: body.cover_image_url ?? null,

    discountId: body.discount ?? null,
  };

  // If unlimited stock, stock can be ignored but we keep it.
  return data;
}

function mapUpdateBodyToData(body) {
  const data = {};

  const setIfPresent = (key, value) => {
    if (Object.prototype.hasOwnProperty.call(body, key))
      data[value[0]] = value[1];
  };

  // Required-ish fields
  if (body.name !== undefined) data.name = body.name;
  if (body.author !== undefined) data.author = body.author;
  if (body.category !== undefined) data.categoryId = body.category;
  if (body.type !== undefined) data.type = body.type;
  if (body.price !== undefined) data.price = body.price;

  // Optional fields (nullable)
  setIfPresent("malayalam_name", ["malayalamName", body.malayalam_name]);
  setIfPresent("author_malayalam", ["authorMalayalam", body.author_malayalam]);
  if (body.best_seller !== undefined) data.bestSeller = body.best_seller;
  setIfPresent("description", ["description", body.description]);
  setIfPresent("edition", ["edition", body.edition]);
  setIfPresent("isbn", ["isbn", body.isbn]);
  setIfPresent("num_of_pages", ["numOfPages", body.num_of_pages]);
  setIfPresent("publisher", ["publisher", body.publisher]);
  setIfPresent("language", ["language", body.language]);
  setIfPresent("discount", ["discountId", body.discount]);
  if (body.status !== undefined) data.status = body.status;
  if (body.award_winner !== undefined) data.awardWinner = body.award_winner;
  if (body.new_arrival !== undefined) data.newArrival = body.new_arrival;
  if (body.republication !== undefined) data.republication = body.republication;
  if (body.highlight !== undefined) data.highlight = body.highlight;
  setIfPresent("rank", ["rank", body.rank]);
  if (body.unlimited_stock !== undefined)
    data.unlimitedStock = body.unlimited_stock;
  if (body.stock !== undefined) data.stock = body.stock;
  setIfPresent("cover_image_url", ["coverImageUrl", body.cover_image_url]);

  return data;
}

export async function adminListCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch (err) {
    throw makeError(
      "Failed to list categories",
      500,
      "ADMIN_CATEGORIES_LIST_FAILED",
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

    // Match your spec response shape
    return {
      book_id: book.id,
      name: book.name,
      author: book.author,
      category: book.category?.id ?? null,
      edition: book.edition ?? null,
      price: book.price,
      discount: book.discountId ?? null,
      cover_img_url: book.coverImageUrl ?? null,
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
    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: body.category },
      select: { id: true },
    });
    if (!category)
      throw makeError("Category not found", 404, "ADMIN_CATEGORY_NOT_FOUND");

    // If discount provided, validate it exists
    if (body.discount) {
      const discount = await prisma.discount.findUnique({
        where: { id: body.discount },
        select: { id: true },
      });
      if (!discount)
        throw makeError("Discount not found", 404, "ADMIN_DISCOUNT_NOT_FOUND");
    }

    const data = mapCreateBodyToData(body);

    const created = await prisma.book.create({
      data,
      select: { id: true },
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

    return { msg: "created successfully", book_id: created.id };
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

    const data = mapUpdateBodyToData(body);

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
      throw makeError("Book not found", 404, "ADMIN_BOOK_NOT_FOUND",err);
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
