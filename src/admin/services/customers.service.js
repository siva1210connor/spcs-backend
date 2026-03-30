// src/admin/services/customers.service.js
import { prisma } from "../../config/prisma.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function parseDDMMYYYYStartOfDay(value) {
  const [dd, mm, yyyy] = value.split("/").map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0));
}

function parseDDMMYYYYEndOfDay(value) {
  const [dd, mm, yyyy] = value.split("/").map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd, 23, 59, 59, 999));
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows) {
  if (!rows.length) {
    return "user_id,name,phone,address,city,district,state,pin_code,created_at\n";
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.join(",");

  const lines = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(",")
  );

  return [headerLine, ...lines].join("\n");
}

function buildWhere(query) {
  const where = {
    role: "USER",
  };

  const and = [];

  if (query.search) {
    const search = query.search.trim();

    and.push({
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
          },
        },
        {
          profile: {
            is: {
              pincode: {
                contains: search,
              },
            },
          },
        },
      ],
    });
  }

  const createdAt = {};

  if (query.from_date) {
    const from = parseDDMMYYYYStartOfDay(query.from_date);
    createdAt.gte = from;
  }

  if (query.to_date) {
    const to = parseDDMMYYYYEndOfDay(query.to_date);
    createdAt.lte = to;
  }

  if (Object.keys(createdAt).length) {
    and.push({ createdAt });
  }

  if (and.length) {
    where.AND = and;
  }

  return where;
}

function composeAddress(profile) {
  if (!profile) return null;
  const parts = [];
  if (profile.addressOne) parts.push(profile.addressOne);
  if (profile.addressTwo) parts.push(profile.addressTwo);
  return parts.length ? parts.join(", ") : null;
}

export async function adminListCustomers({ query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
          profile: {
            select: {
              district: true,
              city: true,
              state: true,
              pincode: true,
              addressOne: true,
              addressTwo: true,
            },
          },
        },
      }),
    ]);

    const items = rows.map((u) => ({
      user_id: u.id,
      name: u.name ?? null,
      phone: u.phone,
      address: composeAddress(u.profile),
      city: u.profile?.city ?? null,
      district: u.profile?.district ?? null,
      state: u.profile?.state ?? null,
      pin_code: u.profile?.pincode ?? null,
      created_at: u.createdAt,
    }));

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError("Failed to list customers", 500, "ADMIN_CUSTOMERS_LIST_FAILED", err);
  }
}

export async function adminExportCustomersCsv({ query }) {
  try {
    const where = buildWhere(query);

    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        profile: {
          select: {
            district: true,
            city: true,
            state: true,
            pincode: true,
            addressOne: true,
            addressTwo: true,
          },
        },
      },
    });

    const items = rows.map((u) => ({
      user_id: u.id,
      name: u.name ?? "",
      phone: u.phone ?? "",
      address: composeAddress(u.profile) ?? "",
      city: u.profile?.city ?? "",
      district: u.profile?.district ?? "",
      state: u.profile?.state ?? "",
      pin_code: u.profile?.pincode ?? "",
      created_at: u.createdAt?.toISOString() ?? "",
    }));

    return toCsv(items);
  } catch (err) {
    throw makeError("Failed to export customers csv", 500, "ADMIN_CUSTOMERS_EXPORT_FAILED", err);
  }
}