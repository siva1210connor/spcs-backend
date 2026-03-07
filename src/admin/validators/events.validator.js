// src/admin/validators/events.validator.js
import { z } from "zod";

const adminEventTypeSchema = z
  .string()
  .transform((v) => v.toLowerCase())
  .refine((v) => ["news", "events"].includes(v), "type must be news or events");

const nullableString = (max = 5000) =>
  z.string().max(max).nullable().optional();

const nullableUrl = () =>
  z.string().url("must be a valid URL").nullable().optional();

const dateStringSchema = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "date must be a valid date");

export const adminListEventsSchema = z.object({
  query: z.object({
    type: adminEventTypeSchema,
  }),
});

export const adminCreateEventSchema = z.object({
  body: z.object({
    type: adminEventTypeSchema,
    title: z.string().min(1, "title is required").max(250),
    date: dateStringSchema,
    time: nullableString(50),
    description: nullableString(5000),
    image: nullableUrl(),
    file_link: nullableUrl(),
  }),
});

export const adminUpdateEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z
    .object({
      type: adminEventTypeSchema.optional(),
      title: z.string().min(1).max(250).optional(),
      date: dateStringSchema.optional(),
      time: nullableString(50),
      description: nullableString(5000),
      image: nullableUrl(),
      file_link: nullableUrl(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const adminDeleteEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});