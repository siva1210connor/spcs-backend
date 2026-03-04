// src/validators/categories.validator.js
import { z } from "zod";

export const listCategoriesSchema = z.object({
  query: z.object({
    // For future use (optional):
    // search: z.string().optional()
  }).optional(),
});