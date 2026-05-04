-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_issuedById_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "issuedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
