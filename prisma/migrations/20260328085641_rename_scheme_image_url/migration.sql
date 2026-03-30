/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Scheme` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Scheme" DROP COLUMN "imageUrl",
ADD COLUMN     "schemeImageUrl" TEXT;
