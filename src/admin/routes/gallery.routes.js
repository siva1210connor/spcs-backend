// src/admin/routes/gallery.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminListAlbumsSchema,
  adminCreateAlbumSchema,
  adminUpdateAlbumSchema,
  adminDeleteAlbumSchema,
  adminListGallerySchema,
  adminGetGallerySchema,
  adminCreateGallerySchema,
  adminUpdateGallerySchema,
  adminDeleteGallerySchema,
} from "../validators/gallery.validator.js";
import {
  adminGalleryAlbumsListController,
  adminGalleryAlbumsCreateController,
  adminGalleryAlbumsUpdateController,
  adminGalleryAlbumsDeleteController,
  adminGalleryListController,
  adminGalleryGetController,
  adminGalleryCreateController,
  adminGalleryUpdateController,
  adminGalleryDeleteController,
} from "../controllers/gallery.controller.js";

export const adminGalleryRouter = Router();

/**
 * Base: {{base_url}}/admin/gallery
 */

// Albums
adminGalleryRouter.get("/albums", validate(adminListAlbumsSchema), adminGalleryAlbumsListController);
adminGalleryRouter.post("/albums", validate(adminCreateAlbumSchema), adminGalleryAlbumsCreateController);
adminGalleryRouter.put("/albums/:id", validate(adminUpdateAlbumSchema), adminGalleryAlbumsUpdateController);
adminGalleryRouter.delete("/albums/:id", validate(adminDeleteAlbumSchema), adminGalleryAlbumsDeleteController);

// Gallery
adminGalleryRouter.get("/", validate(adminListGallerySchema), adminGalleryListController);
adminGalleryRouter.get("/:id", validate(adminGetGallerySchema), adminGalleryGetController);
adminGalleryRouter.post("/", validate(adminCreateGallerySchema), adminGalleryCreateController);
adminGalleryRouter.put("/:id", validate(adminUpdateGallerySchema), adminGalleryUpdateController);
adminGalleryRouter.delete("/:id", validate(adminDeleteGallerySchema), adminGalleryDeleteController);