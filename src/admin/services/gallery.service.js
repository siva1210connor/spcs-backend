// src/admin/services/gallery.service.js
import { prisma } from "../../config/prisma.js";
import { createAdminAuditLog } from "../../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../../audit/audit.constants.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function mapAlbumRow(row) {
  return {
    id: row.id,
    name: row.name,
  };
}

function mapGalleryListRow(row) {
  return {
    id: row.id,
    name: row.album?.name ?? null,
    thumbnail_image_url: row.images?.[0]?.imageUrl ?? null,
  };
}

function mapGalleryDetailRow(row) {
  return {
    album_id: row.albumId,
    image_urls: row.images.map((img) => img.imageUrl),
  };
}

export async function adminListAlbums() {
  try {
    const rows = await prisma.galleryAlbum.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
      },
    });

    return rows.map(mapAlbumRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch albums",
      500,
      "ADMIN_GALLERY_ALBUMS_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateAlbum({ req, name }) {
  try {
    const created = await prisma.galleryAlbum.create({
      data: { name },
      select: { id: true, name: true },
    });

    const response = {
      msg: "created successfully",
      item: mapAlbumRow(created),
    };
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.ALBUM,
      resourceId: created.id,
      message: "Gallery album created",
      beforeJson: null,
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    throw makeError(
      "Failed to create album",
      500,
      "ADMIN_GALLERY_ALBUM_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateAlbum({ req, id, name }) {
  try {
    const existing = await prisma.galleryAlbum.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      throw makeError("Album not found", 404, "ADMIN_GALLERY_ALBUM_NOT_FOUND");
    }
    const updated = await prisma.galleryAlbum.update({
      where: { id },
      data: { name },
      select: { id: true, name: true },
    });

    const response = {
      msg: "updated successfully",
      item: mapAlbumRow(updated),
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.ALBUM,
      resourceId: updated.id,
      message: "Gallery album updated",
      beforeJson: mapAlbumRow(existing),
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Album not found",
        404,
        "ADMIN_GALLERY_ALBUM_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to update album",
      500,
      "ADMIN_GALLERY_ALBUM_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteAlbum({ req, id }) {
  try {
    const existing = await prisma.galleryAlbum.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    await prisma.galleryAlbum.delete({
      where: { id },
    });

    const response = {
      msg: "deleted successfully",
    };
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.ALBUM,
      resourceId: existing.id,
      message: "Gallery album deleted",
      beforeJson: mapAlbumRow(existing),
      afterJson: null,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Album not found",
        404,
        "ADMIN_GALLERY_ALBUM_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to delete album",
      500,
      "ADMIN_GALLERY_ALBUM_DELETE_FAILED",
      err,
    );
  }
}

export async function adminListGallery() {
  try {
    const rows = await prisma.gallery.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        album: {
          select: {
            name: true,
          },
        },
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 1,
          select: {
            imageUrl: true,
          },
        },
      },
    });

    return rows.map(mapGalleryListRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch gallery",
      500,
      "ADMIN_GALLERY_LIST_FAILED",
      err,
    );
  }
}

export async function adminGetGallery({ id }) {
  try {
    const row = await prisma.gallery.findUnique({
      where: { id },
      select: {
        id: true,
        albumId: true,
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            imageUrl: true,
          },
        },
      },
    });

    if (!row) {
      throw makeError("Gallery not found", 404, "ADMIN_GALLERY_NOT_FOUND");
    }

    return mapGalleryDetailRow(row);
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to fetch gallery detail",
      500,
      "ADMIN_GALLERY_DETAIL_FAILED",
      err,
    );
  }
}

export async function adminCreateGallery({ req, albumId, imageUrls }) {
  try {
    const album = await prisma.galleryAlbum.findUnique({
      where: { id: albumId },
      select: { id: true },
    });

    if (!album) {
      throw makeError("Album not found", 404, "ADMIN_GALLERY_ALBUM_NOT_FOUND");
    }

    const created = await prisma.$transaction(async (tx) => {
      const gallery = await tx.gallery.create({
        data: {
          albumId,
        },
        select: { id: true, albumId: true },
      });

      if (imageUrls.length > 0) {
        await tx.galleryImage.createMany({
          data: imageUrls.map((url, index) => ({
            galleryId: gallery.id,
            imageUrl: url,
            sortOrder: index,
          })),
        });
      }

      const finalRow = await tx.gallery.findUnique({
        where: { id: gallery.id },
        select: {
          id: true,
          albumId: true,
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: { imageUrl: true },
          },
        },
      });

      return finalRow;
    });

    const response = {
      msg: "created successfully",
      item: {
        id: created.id,
        ...mapGalleryDetailRow(created),
      },
    };
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.GALLERY,
      resourceId: created.id,
      message: "Gallery created",
      beforeJson: null,
      afterJson: {
        id: created.id,
        ...mapGalleryDetailRow(created),
      },
    });
    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to create gallery",
      500,
      "ADMIN_GALLERY_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateGallery({ req, id, albumId, imageUrls }) {
  try {
    const existingGallery = await prisma.gallery.findUnique({
      where: { id },
      select: {
        id: true,
        albumId: true,
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { imageUrl: true },
        },
      },
    });

    if (!existingGallery) {
      throw makeError("Gallery not found", 404, "ADMIN_GALLERY_NOT_FOUND");
    }

    const album = await prisma.galleryAlbum.findUnique({
      where: { id: albumId },
      select: { id: true },
    });

    if (!album) {
      throw makeError("Album not found", 404, "ADMIN_GALLERY_ALBUM_NOT_FOUND");
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.gallery.update({
        where: { id },
        data: { albumId },
      });

      await tx.galleryImage.deleteMany({
        where: { galleryId: id },
      });

      if (imageUrls.length > 0) {
        await tx.galleryImage.createMany({
          data: imageUrls.map((url, index) => ({
            galleryId: id,
            imageUrl: url,
            sortOrder: index,
          })),
        });
      }

      return tx.gallery.findUnique({
        where: { id },
        select: {
          id: true,
          albumId: true,
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: { imageUrl: true },
          },
        },
      });
    });

    const response = {
      msg: "updated successfully",
      item: {
        id: updated.id,
        ...mapGalleryDetailRow(updated),
      },
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.GALLERY,
      resourceId: updated.id,
      message: "Gallery updated",
      beforeJson: {
        id: existingGallery.id,
        ...mapGalleryDetailRow(existingGallery),
      },
      afterJson: {
        id: updated.id,
        ...mapGalleryDetailRow(updated),
      },
    });
    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to update gallery",
      500,
      "ADMIN_GALLERY_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteGallery({ req, id }) {
  try {
    const existing = await prisma.gallery.findUnique({
      where: { id },
      select: {
        id: true,
        albumId: true,
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { imageUrl: true },
        },
      },
    });

    if (!existing) {
      throw makeError("Gallery not found", 404, "ADMIN_GALLERY_NOT_FOUND");
    }
    await prisma.gallery.delete({
      where: { id },
    });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.GALLERY,
      resourceId: existing.id,
      message: "Gallery deleted",
      beforeJson: {
        id: existing.id,
        ...mapGalleryDetailRow(existing),
      },
      afterJson: null,
    });
    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Gallery not found", 404, "ADMIN_GALLERY_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to delete gallery",
      500,
      "ADMIN_GALLERY_DELETE_FAILED",
      err,
    );
  }
}
