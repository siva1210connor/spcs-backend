// src/admin/services/offers.service.js
import { prisma } from "../../config/prisma.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

export async function adminListOffers() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        offerImageUrl: true,
        link: true,
      },
    });

    // Spec expects [{offer_image_url, link}]
    return offers.map((o) => ({
      id: o.id, // extra useful field for delete (non-breaking)
      offer_image_url: o.offerImageUrl,
      link: o.link ?? null,
    }));
  } catch (err) {
    throw makeError("Failed to fetch offers", 500, "ADMIN_OFFERS_LIST_FAILED", err);
  }
}

/**
 * PUT /admin/offers
 * Replace all offers with the provided list (idempotent).
 */
export async function adminReplaceOffers(offersInput) {
  try {
    // Context: Replace-all is best with transaction:
    // - delete old offers
    // - insert new ones
    const created = await prisma.$transaction(async (tx) => {
      await tx.offer.deleteMany({});

      if (!offersInput?.length) return [];

      const createdRows = await Promise.all(
        offersInput.map((o) =>
          tx.offer.create({
            data: {
              offerImageUrl: o.offer_image_url,
              link: o.link ?? null,
            },
            select: { id: true, offerImageUrl: true, link: true },
          })
        )
      );

      return createdRows;
    });

    return {
      msg: "updated successfully",
      items: created.map((o) => ({
        id: o.id,
        offer_image_url: o.offerImageUrl,
        link: o.link ?? null,
      })),
    };
  } catch (err) {
    throw makeError("Failed to update offers", 500, "ADMIN_OFFERS_UPDATE_FAILED", err);
  }
}

export async function adminDeleteOffer(offerId) {
  try {
    await prisma.offer.delete({
      where: { id: offerId },
    });

    return { msg: "successfully deleted" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Offer not found", 404, "ADMIN_OFFER_NOT_FOUND", err);
    }
    throw makeError("Failed to delete offer", 500, "ADMIN_OFFER_DELETE_FAILED", err);
  }
}