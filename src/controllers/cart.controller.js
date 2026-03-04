// src/controllers/cart.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../services/cart.service.js";

function getUserId(req) {
  const userId = req.user?.sub;
  if (!userId) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    err.code = "UNAUTHORIZED";
    throw err;
  }
  return userId;
}

/**
 * GET /api/cart
 */
export const getCartController = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cart = await getCart(userId);
  return ok(res, cart, "Cart fetched successfully");
});

/**
 * POST /api/cart/items
 */
export const addCartItemController = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { bookId, quantity } = req.validated.body;

  const cart = await addToCart({ userId, bookId, quantity });
  return ok(res, cart, "Item added to cart");
});

/**
 * PUT /api/cart/items/:itemId
 */
export const updateCartItemController = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { itemId } = req.validated.params;
  const { quantity } = req.validated.body;

  const cart = await updateCartItem({ userId, itemId, quantity });
  return ok(res, cart, "Cart item updated");
});

/**
 * DELETE /api/cart/items/:itemId
 */
export const removeCartItemController = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { itemId } = req.validated.params;

  const cart = await removeCartItem({ userId, itemId });
  return ok(res, cart, "Cart item removed");
});

/**
 * DELETE /api/cart/clear
 */
export const clearCartController = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cart = await clearCart(userId);
  return ok(res, cart, "Cart cleared");
});