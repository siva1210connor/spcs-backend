-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('DISCOUNT', 'SHIPPING');

-- DropIndex
DROP INDEX "Feedback_createdAt_idx";

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "type" "RuleType" NOT NULL,
    "fromPrice" DECIMAL(10,2) NOT NULL,
    "toPrice" DECIMAL(10,2) NOT NULL,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "value" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rule_type_isActive_idx" ON "Rule"("type", "isActive");

-- CreateIndex
CREATE INDEX "Rule_type_fromPrice_toPrice_idx" ON "Rule"("type", "fromPrice", "toPrice");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
