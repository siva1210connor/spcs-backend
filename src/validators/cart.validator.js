// src/validators/cart.validator.js
import { z } from "zod";

export const getCartSchema = z.object({
  // no params/body
  query: z.object({}).optional(),
});

export const addCartItemSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, "bookId is required"),
    quantity: z
      .number()
      .int("quantity must be an integer")
      .min(1, "quantity must be at least 1")
      .max(100, "quantity too large"),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "itemId is required"),
  }),
  body: z.object({
    quantity: z
      .number()
      .int("quantity must be an integer")
      .min(1, "quantity must be at least 1")
      .max(100, "quantity too large"),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, "itemId is required"),
  }),
});

export const clearCartSchema = z.object({
  // no params/body
  query: z.object({}).optional(),
});
