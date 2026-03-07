// src/admin/validators/rules.validator.js
import { z } from "zod";

const decimalAsNumber = z
  .union([z.number(), z.string()])
  .transform((v) => Number(v))
  .refine((n) => Number.isFinite(n), "must be a valid number");

const ruleTypeEnum = z.enum(["DISCOUNT", "SHIPPING"]);

export const adminListRulesSchema = z.object({
  query: z
    .object({
      type: ruleTypeEnum.optional(), // optional filter
    })
    .optional(),
});

export const adminCreateRuleSchema = z.object({
  body: z
    .object({
      type: ruleTypeEnum,
      from_price: decimalAsNumber.refine((n) => n >= 0, "from_price must be >= 0"),
      to_price: decimalAsNumber.refine((n) => n > 0, "to_price must be > 0"),
      is_percentage: z.boolean().optional(), // required only for DISCOUNT
      value: decimalAsNumber.refine((n) => n > 0, "value must be > 0"),
      is_active: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.to_price <= data.from_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "to_price must be greater than from_price",
          path: ["to_price"],
        });
      }

      if (data.type === "DISCOUNT") {
        if (typeof data.is_percentage !== "boolean") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "is_percentage is required for DISCOUNT rules",
            path: ["is_percentage"],
          });
        } else if (data.is_percentage && data.value > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "percentage value cannot exceed 100",
            path: ["value"],
          });
        }
      }

      if (data.type === "SHIPPING") {
        // Context: shipping is always flat charge
        if (data.is_percentage === true) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "is_percentage must be false for SHIPPING rules",
            path: ["is_percentage"],
          });
        }
      }
    }),
});

export const adminUpdateRuleSchema = z.object({
  params: z.object({
    ruleId: z.string().min(1, "ruleId required"),
  }),
  body: z
    .object({
      type: ruleTypeEnum.optional(), // allow changing type, but usually not recommended
      from_price: decimalAsNumber.optional(),
      to_price: decimalAsNumber.optional(),
      is_percentage: z.boolean().optional(),
      value: decimalAsNumber.optional(),
      is_active: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.from_price != null && data.from_price < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "from_price must be >= 0", path: ["from_price"] });
      }
      if (data.to_price != null && data.to_price <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "to_price must be > 0", path: ["to_price"] });
      }
      if (data.is_percentage === true && data.value != null && data.value > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "percentage value cannot exceed 100", path: ["value"] });
      }
    }),
});

export const adminDeleteRuleSchema = z.object({
  params: z.object({
    ruleId: z.string().min(1, "ruleId required"),
  }),
});