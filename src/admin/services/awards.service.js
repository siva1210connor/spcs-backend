// src/admin/services/awards.service.js
import { prisma } from "../../config/prisma.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function mapAwardType(type) {
  return type === "aksharapuraskaram" ? "AKSHARAPURASKARAM" : "AWARDED";
}

function mapAwardRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    type: row.type === "AKSHARAPURASKARAM" ? "aksharapuraskaram" : "awarded",
    image_url: row.imageUrl ?? null,
  };
}

export async function adminListAwards() {
  try {
    const rows = await prisma.award.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
      },
    });

    return rows.map(mapAwardRow);
  } catch (err) {
    throw makeError("Failed to fetch awards", 500, "ADMIN_AWARDS_LIST_FAILED", err);
  }
}

export async function adminCreateAward(input) {
  try {
    const created = await prisma.award.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        type: mapAwardType(input.type),
        imageUrl: input.image_url ?? null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
      },
    });

    return {
      msg: "created successfully",
      item: mapAwardRow(created),
    };
  } catch (err) {
    throw makeError("Failed to create award", 500, "ADMIN_AWARD_CREATE_FAILED", err);
  }
}

export async function adminUpdateAward({ id, input }) {
  try {
    const data = {};

    if (input.title !== undefined) data.title = input.title;
    if (Object.prototype.hasOwnProperty.call(input, "description")) data.description = input.description;
    if (input.type !== undefined) data.type = mapAwardType(input.type);
    if (Object.prototype.hasOwnProperty.call(input, "image_url")) data.imageUrl = input.image_url;

    const updated = await prisma.award.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
      },
    });

    return {
      msg: "updated successfully",
      item: mapAwardRow(updated),
    };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND", err);
    }
    throw makeError("Failed to update award", 500, "ADMIN_AWARD_UPDATE_FAILED", err);
  }
}

export async function adminDeleteAward({ id }) {
  try {
    await prisma.award.delete({
      where: { id },
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND", err);
    }
    throw makeError("Failed to delete award", 500, "ADMIN_AWARD_DELETE_FAILED", err);
  }
}