-- CreateEnum
CREATE TYPE "SchemeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Scheme" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "status" "SchemeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeEnrollment" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemeEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scheme_status_idx" ON "Scheme"("status");

-- CreateIndex
CREATE INDEX "Scheme_createdAt_idx" ON "Scheme"("createdAt");

-- CreateIndex
CREATE INDEX "SchemeEnrollment_schemeId_idx" ON "SchemeEnrollment"("schemeId");

-- CreateIndex
CREATE INDEX "SchemeEnrollment_userId_idx" ON "SchemeEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeEnrollment_schemeId_userId_key" ON "SchemeEnrollment"("schemeId", "userId");

-- AddForeignKey
ALTER TABLE "SchemeEnrollment" ADD CONSTRAINT "SchemeEnrollment_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeEnrollment" ADD CONSTRAINT "SchemeEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
