// src/services/books.service.js
import { prisma } from "../config/prisma.js";

/**
 * Build Prisma "where" clause from validated query
 */
function buildWhere(query) {
  const where = {
    status: "ACTIVE",
  };

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (typeof query.best_seller === "boolean") {
    where.bestSeller = query.best_seller;
  }

  if (typeof query.new_arrival === "boolean") {
    where.newArrival = query.new_arrival;
  }

  if (query.language) {
    where.language = { equals: query.language, mode: "insensitive" };
  }

  // Search across name/author/isbn (case-insensitive)
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { author: { contains: query.search, mode: "insensitive" } },
      { isbn: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // Price filtering
  if (typeof query.minPrice === "number" || typeof query.maxPrice === "number") {
    where.price = {};
    if (typeof query.minPrice === "number") where.price.gte = query.minPrice;
    if (typeof query.maxPrice === "number") where.price.lte = query.maxPrice;
  }

  return where;
}

/**
 * Sorting mapper
 */
function buildOrderBy(sort) {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price_desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "rank_asc":
      return [{ rank: "asc" }, { createdAt: "desc" }];
    case "rank_desc":
      return [{ rank: "desc" }, { createdAt: "desc" }];
    case "latest":
    default:
      return [{ createdAt: "desc" }];
  }
}

/**
 * List books with filters + pagination
 * @param {{ query: any }} params - expects validated query from listBooksSchema
 */
export async function listBooks({ query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);
    const orderBy = buildOrderBy(query.sort ?? "latest");

    const [total, items] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          author: true,
          type: true,
          price: true,
          language: true,
          bestSeller: true,
          newArrival: true,
          awardWinner: true,
          coverImageUrl: true,
          unlimitedStock: true,
          stock: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
        },
      }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    const error = new Error("Failed to list books");
    error.statusCode = 500;
    error.code = "BOOKS_LIST_FAILED";
    error.cause = err;
    throw error;
  }
}

/**
 * Get book by id
 * @param {{ bookId: string }} params
 */
export async function getBookById({ bookId }) {
  try {
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        malayalamName: true,
        author: true,
        authorMalayalam: true,
        type: true,
        description: true,
        edition: true,
        isbn: true,
        numOfPages: true,
        publisher: true,
        language: true,
        price: true,
        bestSeller: true,
        newArrival: true,
        awardWinner: true,
        republication: true,
        highlight: true,
        rank: true,
        unlimitedStock: true,
        stock: true,
        coverImageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!book) {
      const error = new Error("Book not found");
      error.statusCode = 404;
      error.code = "BOOK_NOT_FOUND";
      throw error;
    }

    return book;
  } catch (err) {
    // If it was already a structured error, rethrow as-is
    if (err?.code && err?.statusCode) throw err;

    const error = new Error("Failed to fetch book");
    error.statusCode = 500;
    error.code = "BOOK_FETCH_FAILED";
    error.cause = err;
    throw error;
  }
}