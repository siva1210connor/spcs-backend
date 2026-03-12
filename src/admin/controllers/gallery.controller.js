// src/admin/controllers/gallery.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListAlbums,
  adminCreateAlbum,
  adminUpdateAlbum,
  adminDeleteAlbum,
  adminListGallery,
  adminGetGallery,
  adminCreateGallery,
  adminUpdateGallery,
  adminDeleteGallery,
} from "../services/gallery.service.js";

export const adminGalleryAlbumsListController = asyncHandler(
  async (req, res) => {
    const data = await adminListAlbums();
    return ok(res, data, "Albums fetched");
  },
);

export const adminGalleryAlbumsCreateController = asyncHandler(
  async (req, res) => {
    const { name } = req.validated.body;
    const data = await adminCreateAlbum({ req, name });
    return ok(res, data, data.msg);
  },
);

export const adminGalleryAlbumsUpdateController = asyncHandler(
  async (req, res) => {
    const { id } = req.validated.params;
    const { name } = req.validated.body;
    const data = await adminUpdateAlbum({ req, id, name });
    return ok(res, data, data.msg);
  },
);

export const adminGalleryAlbumsDeleteController = asyncHandler(
  async (req, res) => {
    const { id } = req.validated.params;
    const data = await adminDeleteAlbum({ req, id });
    return ok(res, data, data.msg);
  },
);

export const adminGalleryListController = asyncHandler(async (req, res) => {
  const data = await adminListGallery();
  return ok(res, data, "Gallery fetched");
});

export const adminGalleryGetController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminGetGallery({ id });
  return ok(res, data, "Gallery fetched");
});

export const adminGalleryCreateController = asyncHandler(async (req, res) => {
  const { album_id, image_urls } = req.validated.body;
  const data = await adminCreateGallery({
    req,
    albumId: album_id,
    imageUrls: image_urls,
  });
  return ok(res, data, data.msg);
});

export const adminGalleryUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { album_id, image_urls } = req.validated.body;

  const data = await adminUpdateGallery({
    req,
    id,
    albumId: album_id,
    imageUrls: image_urls,
  });

  return ok(res, data, data.msg);
});

export const adminGalleryDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteGallery({ req, id });
  return ok(res, data, data.msg);
});
