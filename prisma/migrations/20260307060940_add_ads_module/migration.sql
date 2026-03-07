-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('SQUARE', 'BANNER');

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "type" "AdType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ad_type_idx" ON "Ad"("type");

-- CreateIndex
CREATE INDEX "Ad_createdAt_idx" ON "Ad"("createdAt");
