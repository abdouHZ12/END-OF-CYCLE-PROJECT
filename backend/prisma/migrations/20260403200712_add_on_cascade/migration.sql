-- DropForeignKey
ALTER TABLE "AbsenceAuth" DROP CONSTRAINT "AbsenceAuth_documentId_fkey";

-- DropForeignKey
ALTER TABLE "ExitSlip" DROP CONSTRAINT "ExitSlip_documentId_fkey";

-- DropForeignKey
ALTER TABLE "MissionOrder" DROP CONSTRAINT "MissionOrder_documentId_fkey";

-- AddForeignKey
ALTER TABLE "MissionOrder" ADD CONSTRAINT "MissionOrder_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceAuth" ADD CONSTRAINT "AbsenceAuth_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitSlip" ADD CONSTRAINT "ExitSlip_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
