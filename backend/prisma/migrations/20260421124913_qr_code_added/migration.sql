/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_qrCode_key" ON "Document"("qrCode");
