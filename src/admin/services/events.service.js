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


function formatEventBadge(dateValue) {
  const date = new Date(dateValue);

  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
  };
}

function mapEventCategory(type) {
  return type === "NEWS" ? "NEWS" : "EVENT";
}
function mapEventRow(row) {
  const badge = formatEventBadge(row.date);

  return {
    id: row.id,
    type: row.type === "NEWS" ? "news" : "events",
    category_label: mapEventCategory(row.type),
    title: row.title,
    date: row.date,
    badge_month: badge.month,
    badge_day: badge.day,
    time: row.time ?? null,
    location: row.location ?? null,
    description: row.description ?? null,
    image_url: row.imageUrl ?? null,
    attachment_url: row.fileLink ?? null,
  };
}

export async function adminListEvents({ type }) {
  try {
    const dbType = mapContentType(type);

    const rows = await prisma.eventItem.findMany({
      where: { type: dbType },
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        location: true,
        description: true,
        imageUrl: true,
        fileLink: true,
        createdAt: true,
      },
    });

    return rows.map(mapEventRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch events",
      500,
      "ADMIN_EVENTS_LIST_FAILED",
      err
    );
  }
}

export async function adminCreateEvent({ req, input }) {
  try {
    const imageFile = req.files?.image?.[0] ?? null;
    const attachmentFile = req.files?.attachment?.[0] ?? null;

    const created = await prisma.eventItem.create({
      data: {
        type: mapContentType(input.type),
        title: input.title,
        date: new Date(input.date),
        time: input.time ?? null,
        location: input.location ?? null,
        description: input.description ?? null,
        imageUrl: imageFile ? `/uploads/events/${imageFile.filename}` : null,
        fileLink: attachmentFile
          ? `/uploads/event-attachments/${attachmentFile.filename}`
          : null,
      },
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        location: true,
        description: true,
        imageUrl: true,
        fileLink: true,
        createdAt: true,
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
      msg: "Event created successfully",
      item: mapEventRow(created),
    };
  } catch (err) {
    throw makeError(
      "Failed to create event",
      500,
      "ADMIN_EVENT_CREATE_FAILED",
      err
    );
  }
}
export async function adminUpdateEvent({ req, id, input = {} }) {
  try {
    const existing = await prisma.eventItem.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        location: true,
        description: true,
        imageUrl: true,
        fileLink: true,
      },
    });

    if (!existing) {
      throw makeError("Event not found", 404, "ADMIN_EVENT_NOT_FOUND");
    }

    const hasBodyFields =
      input.type !== undefined ||
      input.title !== undefined ||
      input.date !== undefined ||
      Object.prototype.hasOwnProperty.call(input, "time") ||
      Object.prototype.hasOwnProperty.call(input, "location") ||
      Object.prototype.hasOwnProperty.call(input, "description");

    const hasImageFile = !!req.files?.image?.[0];
    const hasAttachmentFile = !!req.files?.attachment?.[0];

    if (!hasBodyFields && !hasImageFile && !hasAttachmentFile) {
      throw makeError(
        "At least one field must be provided",
        400,
        "ADMIN_EVENT_UPDATE_EMPTY"
      );
    }

    const data = {};

    if (input.type !== undefined) data.type = mapContentType(input.type);
    if (input.title !== undefined) data.title = input.title;
    if (input.date !== undefined) data.date = new Date(input.date);

    if (Object.prototype.hasOwnProperty.call(input, "time")) {
      data.time = input.time ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(input, "location")) {
      data.location = input.location ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(input, "description")) {
      data.description = input.description ?? null;
    }

    const imageFile = req.files?.image?.[0] ?? null;
    const attachmentFile = req.files?.attachment?.[0] ?? null;

    if (imageFile) {
      data.imageUrl = `/uploads/events/${imageFile.filename}`;
    }

    if (attachmentFile) {
      data.fileLink = `/uploads/event-attachments/${attachmentFile.filename}`;
    }

    const updated = await prisma.eventItem.update({
      where: { id },
      data,
      select: {
        id: true,
        type: true,
        title: true,
        date: true,
        time: true,
        location: true,
        description: true,
        imageUrl: true,
        fileLink: true,
      },
    });

    const response = {
      msg: "Event updated successfully",
      item: mapEventRow(updated),
    };

    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.EVENT,
      resourceId: updated.id,
      message: "Event updated",
      beforeJson: mapEventRow(existing),
      afterJson: response.item,
    });

    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Event not found", 404, "ADMIN_EVENT_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to update event",
      500,
      "ADMIN_EVENT_UPDATE_FAILED",
      err
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
        location: true,
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
      beforeJson: mapEventRow(existing),
      afterJson: null,
    });

    return { msg: "Event deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Event not found", 404, "ADMIN_EVENT_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to delete event",
      500,
      "ADMIN_EVENT_DELETE_FAILED",
      err
    );
  }
}