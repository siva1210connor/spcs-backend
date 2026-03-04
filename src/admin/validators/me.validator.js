// src/admin/validators/me.validator.js
import { z } from "zod";

/**
 * GET /api/admin/me
 * No params/body required.
 */
export const adminMeSchema = z.object({
  query: z.object({}).optional(),
});