/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `LeaveSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `LeaveSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LeaveSession" ADD COLUMN     "employeeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LeaveSession_employeeId_key" ON "LeaveSession"("employeeId");
