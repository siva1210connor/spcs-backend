-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "discountId" TEXT;

-- CreateIndex
CREATE INDEX "Book_discountId_idx" ON "Book"("discountId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
