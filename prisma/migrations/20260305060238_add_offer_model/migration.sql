-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "offerImageUrl" TEXT NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");
