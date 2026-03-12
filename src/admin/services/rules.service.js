// src/admin/services/rules.service.js
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

async function assertNoOverlap({ type, fromPrice, toPrice, excludeId }) {
  const overlap = await prisma.rule.findFirst({
    where: {
      type,
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      AND: [{ fromPrice: { lte: toPrice } }, { toPrice: { gte: fromPrice } }],
    },
    select: { id: true },
  });

  if (overlap) {
    throw makeError(
      `Active ${type} rule overlaps an existing rule range`,
      409,
      "RULE_RANGE_OVERLAP",
    );
  }
}

function mapRule(r) {
  return {
    id: r.id,
    rule_type: r.type, // DISCOUNT | SHIPPING
    from_price: r.fromPrice,
    to_price: r.toPrice,
    is_percentage: r.isPercentage,
    value: r.value,
    is_active: r.isActive,
  };
}

export async function adminListRules({ query } = {}) {
  try {
    const where = query?.type ? { type: query.type } : {};
    const rules = await prisma.rule.findMany({
      where,
      orderBy: [{ type: "asc" }, { isActive: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        type: true,
        fromPrice: true,
        toPrice: true,
        isPercentage: true,
        value: true,
        isActive: true,
      },
    });

    return rules.map(mapRule);
  } catch (err) {
    throw makeError(
      "Failed to list rules",
      500,
      "ADMIN_RULES_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateRule(req, input) {
  try {
    const type = input.type;
    const fromPrice = input.from_price;
    const toPrice = input.to_price;

    await assertNoOverlap({ type, fromPrice, toPrice });

    const isPercentage =
      type === "DISCOUNT" ? Boolean(input.is_percentage) : false;

    const created = await prisma.rule.create({
      data: {
        type,
        fromPrice,
        toPrice,
        isPercentage,
        value: input.value,
        isActive: input.is_active ?? true,
      },
      select: {
        id: true,
        type: true,
        fromPrice: true,
        toPrice: true,
        isPercentage: true,
        value: true,
        isActive: true,
      },
    });

    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.RULE,
      resourceId: created.id,
      message: `Rule created (${created.type})`,
      beforeJson: null,
      afterJson: response.rule,
    });

    return { msg: "created successfully", rule: mapRule(created) };
  } catch (err) {
    if (err?.code === "RULE_RANGE_OVERLAP") throw err;
    throw makeError(
      "Failed to create rule",
      500,
      "ADMIN_RULE_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateRule({ req, ruleId, input }) {
  try {
    const existing = await prisma.rule.findUnique({
      where: { id: ruleId },
      select: {
        id: true,
        type: true,
        fromPrice: true,
        toPrice: true,
        isActive: true,
        isPercentage: true,
        isActive: true,
      },
    });

    if (!existing) throw makeError("Rule not found", 404, "RULE_NOT_FOUND");

    const nextType = input.type ?? existing.type;
    const nextFrom = input.from_price ?? existing.fromPrice;
    const nextTo = input.to_price ?? existing.toPrice;
    const nextActive = input.is_active ?? existing.isActive;

    if (nextActive) {
      await assertNoOverlap({
        type: nextType,
        fromPrice: nextFrom,
        toPrice: nextTo,
        excludeId: ruleId,
      });
    }

    const nextIsPercentage =
      nextType === "DISCOUNT"
        ? (input.is_percentage ?? existing.isPercentage)
        : false;

    const updated = await prisma.rule.update({
      where: { id: ruleId },
      data: {
        type: input.type ?? undefined,
        fromPrice: input.from_price ?? undefined,
        toPrice: input.to_price ?? undefined,
        isPercentage: nextIsPercentage,
        value: input.value ?? undefined,
        isActive: input.is_active ?? undefined,
      },
      select: {
        id: true,
        type: true,
        fromPrice: true,
        toPrice: true,
        isPercentage: true,
        value: true,
        isActive: true,
      },
    });

    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.RULE,
      resourceId: updated.id,
      message: `Rule updated (${updated.type})`,
      beforeJson: mapRule(existing),
      afterJson: response.rule,
    });

    return { msg: "updated successfully", rule: mapRule(updated) };
  } catch (err) {
    if (err?.code === "RULE_RANGE_OVERLAP") throw err;
    if (err?.code === "RULE_NOT_FOUND") throw err;
    if (err?.code === "P2025")
      throw makeError("Rule not found", 404, "RULE_NOT_FOUND", err);
    throw makeError(
      "Failed to update rule",
      500,
      "ADMIN_RULE_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteRule({ req, ruleId }) {
  try {
    const existing = await prisma.rule.findUnique({
      where: { id: ruleId },
      select: {
        id: true,
        type: true,
        fromPrice: true,
        toPrice: true,
        isPercentage: true,
        value: true,
        isActive: true,
      },
    });

    if (!existing) {
      throw makeError("Rule not found", 404, "RULE_NOT_FOUND");
    }
    await prisma.rule.delete({ where: { id: ruleId } });

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.RULE,
      resourceId: existing.id,
      message: `Rule deleted (${existing.type})`,
      beforeJson: mapRule(existing),
      afterJson: null,
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025")
      throw makeError("Rule not found", 404, "RULE_NOT_FOUND", err);
    throw makeError(
      "Failed to delete rule",
      500,
      "ADMIN_RULE_DELETE_FAILED",
      err,
    );
  }
}
