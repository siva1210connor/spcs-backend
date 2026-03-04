// src/services/categories.service.js
import { prisma } from "../config/prisma.js";

export async function listCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  } catch (err) {
    const error = new Error("Failed to list categories");
    error.statusCode = 500;
    error.code = "CATEGORIES_LIST_FAILED";
    error.cause = err;
    throw error;
  }
}