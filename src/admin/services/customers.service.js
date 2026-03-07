// src/admin/services/customers.service.js
import { prisma } from "../../config/prisma.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function parseDDMMYYYY(s, endOfDay = false) {
  if (!s) return null;
  const [dd, mm, yyyy] = s.split("-").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

function buildWhere({ search, from_date, to_date }) {
  const where = { role: "USER" }; // Only customers (not admins)

  const from = parseDDMMYYYY(from_date, false);
  const to = parseDDMMYYYY(to_date, true);
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      // Profile fields search (optional)
      { profile: { city: { contains: search, mode: "insensitive" } } },
      { profile: { state: { contains: search, mode: "insensitive" } } },
      { profile: { pincode: { contains: search, mode: "insensitive" } } },
    ];
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