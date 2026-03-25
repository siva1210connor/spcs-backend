// src/admin/services/me.service.js
import { email } from "zod";
import { prisma } from "../../config/prisma.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) {
    console.error("SERVICE ERROR:", {
      code,
      message,
      cause,
    });
  }

  return err;
}

/**
 * Returns minimal admin profile data for header/topbar usage.
 * @param {string} adminUserId
 */
export async function getAdminMe(adminUserId) {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!admin) {
      throw makeError("Admin user not found", 404, "ADMIN_NOT_FOUND");
    }

    if (admin.role !== "ADMIN") {
      throw makeError(
        "Forbidden: admin access required",
        403,
        "FORBIDDEN_ADMIN",
      );
    }

    // API spec says: return { name }
    return { name: admin.name ?? "Admin", email: admin.email ?? null };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to fetch admin profile",
      500,
      "ADMIN_ME_FAILED",
      err,
    );
  }
}
