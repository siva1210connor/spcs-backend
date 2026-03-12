// src/upload/upload.validator.js
import { z } from "zod";
import { ALLOWED_MODULES } from "./upload.constants.js";

export const adminUploadSchema = z.object({
  body: z.object({
    module: z
      .string()
      .min(1, "module is required")
      .refine((v) => ALLOWED_MODULES.includes(v), "invalid module"),
  }),
});