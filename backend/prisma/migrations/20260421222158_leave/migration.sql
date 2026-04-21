-- DropForeignKey
ALTER TABLE "LeaveSession" DROP CONSTRAINT "LeaveSession_documentId_fkey";

-- AddForeignKey
ALTER TABLE "LeaveSession" ADD CONSTRAINT "LeaveSession_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
