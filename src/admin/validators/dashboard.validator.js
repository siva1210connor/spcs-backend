// src/admin/validators/dashboard.validator.js
import { z } from "zod";

const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine((n) => Number.isInteger(n) && n >= 1, "page must be >= 1"),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 100, "limit must be 1-100"),
});

export const adminDashboardSchema = z.object({
  query: z.object({}).optional(),
});

export const listSlidersSchema = z.object({
  query: z.object({
    page: paginationSchema.shape.page,
    limit: paginationSchema.shape.limit,
  }),
});
export const createSliderSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).nullable().optional(),
    slider_url: z.string().url("slider_url must be a valid URL").nullable().optional(),
  }),
});

export const updateSliderSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      title: z.string().min(1).max(200).nullable().optional(),
      slider_url: z.string().url("slider_url must be a valid URL").nullable().optional(),
    })
    .strict()
    .refine((b) => Object.keys(b).length > 0, "At least one field must be provided"),
});

export const deleteSliderSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});


// Notifications validators

export const listNotificationsSchema = z.object({
  query: z.object({
    page: paginationSchema.shape.page,
    limit: paginationSchema.shape.limit,
  }),
});

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).nullable().optional(),
    notification_url: z
      .string()
      .url("notification_url must be a valid URL")
      .nullable()
      .optional(),
  }),
});

export const updateNotificationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    notification_url: z
      .string()
      .url("notification_url must be a valid URL")
      .nullable()
      .optional(),
  }),
});

export const deleteNotificationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});


// Branch validators
export const listBranchesSchema = z.object({
  query: z.object({
    page: paginationSchema.shape.page,
    limit: paginationSchema.shape.limit,
  }),
});

export const createBranchSchema = z.object({
  body: z.object({
    branch_name: z.string().min(1).max(200),
    branch_address: z.string().max(1000).nullable().optional(),
    phone: z.string().max(50).nullable().optional(),
    map_url: z.string().url("map_url must be a valid URL").nullable().optional(),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      branch_name: z.string().min(1).max(200).nullable().optional(),
      branch_address: z.string().max(1000).nullable().optional(),
      phone: z.string().max(50).nullable().optional(),
      map_url: z.string().url("map_url must be a valid URL").nullable().optional(),
    })
    .strict()
    .refine((b) => Object.keys(b).length > 0, "At least one field must be provided"),
});

export const deleteBranchSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});