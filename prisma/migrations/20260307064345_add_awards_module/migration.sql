-- CreateEnum
CREATE TYPE "AwardType" AS ENUM ('AKSHARAPURASKARAM', 'AWARDED');

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "AwardType" NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Award_type_idx" ON "Award"("type");

-- CreateIndex
CREATE INDEX "Award_createdAt_idx" ON "Award"("createdAt");
