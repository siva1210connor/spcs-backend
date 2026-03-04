// src/services/cart.service.js
import { prisma } from "../config/prisma.js";

/**
 * Small helper to create structured errors for easy debugging
 */
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

async function getOrCreateCart(tx, userId) {
  return tx.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true, userId: true },
  });
}

function enforceQuantityRules(bookType, requestedQty) {
  // Recommended rule: digital items always quantity 1
  if (bookType === "EBOOK" || bookType === "AUDIOBOOK") return 1;
  return requestedQty;
}

function ensureStock(book, desiredQty) {
  // Only enforce for hard copies
  if (book.type !== "HARD_COPY") return;

  if (book.unlimitedStock) return;

  if (book.stock < desiredQty) {
    throw makeError(
      `Insufficient stock. Available: ${book.stock}, requested: ${desiredQty}`,
      409,
      "OUT_OF_STOCK",
    );
  }
}

async function fetchCartView(userId) {
  // returns a clean cart view for API responses
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      items: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quantity: true,
          book: {
            select: {
              id: true,
              name: true,
              author: true,
              type: true,
              price: true,
              language: true,
              coverImageUrl: true,
              unlimitedStock: true,
              stock: true,
              status: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      },
      updatedAt: true,
    },
  });

  // If cart doesn't exist yet, return empty
  if (!cart) {
    return { id: null, userId, items: [], updatedAt: null };
  }

  return cart;
}

export async function getCart(userId) {
  try {
    // ensure cart exists so user always gets a cart
    await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    return await fetchCartView(userId);
  } catch (cause) {
    throw makeError("Failed to fetch cart", 500, "CART_FETCH_FAILED", cause);
  }
}

export async function addToCart({ userId, bookId, quantity }) {
  try {
    await prisma.$transaction(async (tx) => {
      const cart = await getOrCreateCart(tx, userId);

      const book = await tx.book.findFirst({
        where: { id: bookId, status: "ACTIVE" },
        select: {
          id: true,
          status: true,
          type: true,
          unlimitedStock: true,
          stock: true,
        },
      });

      if (!book) {
        throw makeError("Book not found or inactive", 404, "BOOK_NOT_FOUND");
      }

      const existing = await tx.cartItem.findUnique({
        where: { cartId_bookId: { cartId: cart.id, bookId } },
        select: { id: true, quantity: true },
      });

      const requestedQty = enforceQuantityRules(book.type, quantity);

      const desiredQty = existing
        ? enforceQuantityRules(book.type, existing.quantity + quantity)
        : requestedQty;

      ensureStock(book, desiredQty);

      await tx.cartItem.upsert({
        where: { cartId_bookId: { cartId: cart.id, bookId } },
        update: { quantity: desiredQty },
        create: { cartId: cart.id, bookId, quantity: desiredQty },
      });
    });

    return await fetchCartView(userId);
  } catch (err) {
    // pass through structured errors
    if (err?.code && err?.statusCode) throw err;
    throw makeError("Failed to add item to cart", 500, "CART_ADD_FAILED", err);
  }
}

export async function updateCartItem({ userId, itemId, quantity }) {
  try {
    await prisma.$transaction(async (tx) => {
      // fetch item ensuring it belongs to this user
      const item = await tx.cartItem.findFirst({
        where: { id: itemId, cart: { userId } },
        select: {
          id: true,
          cartId: true,
          bookId: true,
          quantity: true,
          book: {
            select: {
              id: true,
              status: true,
              type: true,
              unlimitedStock: true,
              stock: true,
            },
          },
        },
      });

      if (!item) {
        throw makeError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
      }

      if (item.book.status !== "ACTIVE") {
        throw makeError(
          "Book is inactive and cannot be purchased",
          409,
          "BOOK_INACTIVE",
        );
      }

      const desiredQty = enforceQuantityRules(item.book.type, quantity);

      ensureStock(item.book, desiredQty);

      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity: desiredQty },
      });
    });

    return await fetchCartView(userId);
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to update cart item",
      500,
      "CART_UPDATE_FAILED",
      err,
    );
  }
}

export async function removeCartItem({ userId, itemId }) {
  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: { id: itemId, cart: { userId } },
        select: { id: true },
      });

      if (!item) {
        throw makeError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
      }

      await tx.cartItem.delete({ where: { id: itemId } });
    });

    return await fetchCartView(userId);
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to remove cart item",
      500,
      "CART_REMOVE_FAILED",
      err,
    );
  }
}

export async function clearCart(userId) {
  try {
    await prisma.$transaction(async (tx) => {
      const cart = await getOrCreateCart(tx, userId);

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    });

    return await fetchCartView(userId);
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError("Failed to clear cart", 500, "CART_CLEAR_FAILED", err);
  }
}
