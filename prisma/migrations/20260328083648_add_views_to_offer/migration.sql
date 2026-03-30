-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "title" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
