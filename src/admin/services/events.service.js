// src/admin/services/events.service.js
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

function mapContentType(type) {
  return type === "news" ? "NEWS" : "EVENTS";
}

function mapEventRow(row) {
  return {
    id: row.id,
    type: row.type === "NEWS" ? "news" : "events",
    title: row.title,
    date: row.date,
    time: row.time ?? null,
    description: row.description ?? null,
    image: row.imageUrl ?? null,
    file_link: row.fileLink ?? null,
  };
}

export async function adminListEvents({ type }) {
  try {
    const dbType = mapContentType(type);

    const rows = await prisma.eventItem.findMany({
      where: { type: dbType },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        description: true,
        imageUrl: true,
        fileLink: true,
      },
    });

    return rows.map(mapEventRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch events",
      500,
      "ADMIN_EVENTS_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateEvent(req, input) {
  try {
    const created = await prisma.eventItem.create({
      data: {
        type: mapContentType(input.type),
        title: input.title,
        date: new Date(input.date),
        time: input.time ?? null,
        description: input.description ?? null,
        imageUrl: input.image ?? null,
        fileLink: input.file_link ?? null,
      },
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        description: true,
        imageUrl: true,
        fileLink: true,
      },
    });

    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.EVENT,
      resourceId: created.id,
      message: `Event created (${created.type})`,
      beforeJson: null,
      afterJson: mapEventRow(created),
    });
    return {
      msg: "created successfully",
      item: mapEventRow(created),
    };
  } catch (err) {
    throw makeError(
      "Failed to create event",
      500,
      "ADMIN_EVENT_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateEvent({ req, id, input }) {
  try {
    const existing = await prisma.eventItem.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        description: true,
        imageUrl: true,
        fileLink: true,
      },
    });

    if (!existing) {
      throw makeError("Event not found", 404, "ADMIN_EVENT_NOT_FOUND");
    }
    const data = {};

    if (input.type !== undefined) data.type = mapContentType(input.type);
    if (input.title !== undefined) data.title = input.title;
    if (input.date !== undefined) data.date = new Date(input.date);
    if (Object.prototype.hasOwnProperty.call(input, "time"))
      data.time = input.time;
    if (Object.prototype.hasOwnProperty.call(input, "description"))
      data.description = input.description;
    if (Object.prototype.hasOwnProperty.call(input, "image"))
      data.imageUrl = input.image;
    if (Object.prototype.hasOwnProperty.call(input, "file_link"))
      data.fileLink = input.file_link;

    const updated = await prisma.eventItem.update({
      where: { id },
      data,
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        description: true,
        imageUrl: true,
        fileLink: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapEventRow(updated),
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.EVENT,
      resourceId: updated.id,
      message: "Event updated",
      beforeJson: {
        ...existing,
        image: existing.imageUrl,
        file_link: existing.fileLink,
      },
      afterJson: response.item,
    });
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Event not found", 404, "ADMIN_EVENT_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to update event",
      500,
      "ADMIN_EVENT_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteEvent({ req, id }) {
  try {
    const existing = await prisma.eventItem.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        description: true,
        imageUrl: true,
        fileLink: true,
      },
    });

    if (!existing) {
      throw makeError("Event not found", 404, "ADMIN_EVENT_NOT_FOUND");
    }
    await prisma.eventItem.delete({
      where: { id },
    });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.EVENT,
      resourceId: existing.id,
      message: "Event deleted",
      beforeJson: {
        ...existing,
        image: existing.imageUrl,
        file_link: existing.fileLink,
      },
      afterJson: null,
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Event not found", 404, "ADMIN_EVENT_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to delete event",
      500,
      "ADMIN_EVENT_DELETE_FAILED",
      err,
    );
  }
}
