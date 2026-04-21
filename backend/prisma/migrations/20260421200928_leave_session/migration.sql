-- CreateEnum
CREATE TYPE "StatusLeave" AS ENUM ('OUT', 'RETURNED', 'NOT_RETURNED');

-- CreateTable
CREATE TABLE "LeaveSession" (
    "id" SERIAL NOT NULL,
    "year" TEXT NOT NULL,
    "status" "StatusLeave",
    "leaveTime" TIMESTAMP(3),
    "returnTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentId" INTEGER NOT NULL,

    CONSTRAINT "LeaveSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveSession_year_key" ON "LeaveSession"("year");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveSession_documentId_key" ON "LeaveSession"("documentId");

-- AddForeignKey
ALTER TABLE "LeaveSession" ADD CONSTRAINT "LeaveSession_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
