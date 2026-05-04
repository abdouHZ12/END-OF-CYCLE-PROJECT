/*
  Warnings:

  - A unique constraint covering the columns `[managerId]` on the table `Structure` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Structure" ADD COLUMN     "managerId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Structure_managerId_key" ON "Structure"("managerId");

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
