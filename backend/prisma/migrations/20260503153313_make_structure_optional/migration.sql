-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_structureId_fkey";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "structureId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
