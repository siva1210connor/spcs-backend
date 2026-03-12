// src/admin/validators/gallery.validator.js
import { z } from "zod";

const imageUrlsSchema = z
  .array(z.string().url("Each image url must be valid"))
  .min(1, "At least one image is required");

export const adminListAlbumsSchema = z.object({
  query: z.object({}).optional(),
});

export const adminCreateAlbumSchema = z.object({
  body: z.object({
    name: z.string().min(1, "name is required").max(250),
  }),
});

export const adminUpdateAlbumSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z.object({
    name: z.string().min(1, "name is required").max(250),
  }),
});

export const adminDeleteAlbumSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});

export const adminListGallerySchema = z.object({
  query: z.object({}).optional(),
});

export const adminGetGallerySchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});

export const adminCreateGallerySchema = z.object({
  body: z.object({
    album_id: z.string().min(1, "album_id is required"),
    image_urls: imageUrlsSchema,
  }),
});

export const adminUpdateGallerySchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
  body: z.object({
    album_id: z.string().min(1, "album_id is required"),
    image_urls: imageUrlsSchema,
  }),
});

export const adminDeleteGallerySchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});