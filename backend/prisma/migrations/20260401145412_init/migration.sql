/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Document` table. All the data in the column will be lost.
  - The `status` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `issuedById` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_employeeId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "employeeId",
ADD COLUMN     "decisionMadeById" INTEGER,
ADD COLUMN     "issuedById" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_decisionMadeById_fkey" FOREIGN KEY ("decisionMadeById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
