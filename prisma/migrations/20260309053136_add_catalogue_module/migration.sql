-- CreateTable
CREATE TABLE "Catalogue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" TEXT,
    "uploadedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Catalogue_uploadedDate_idx" ON "Catalogue"("uploadedDate");

-- CreateIndex
CREATE INDEX "Catalogue_createdAt_idx" ON "Catalogue"("createdAt");
