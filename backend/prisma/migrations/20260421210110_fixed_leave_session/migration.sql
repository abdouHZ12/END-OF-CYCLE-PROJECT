/*
  Warnings:

  - You are about to drop the column `year` on the `LeaveSession` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LeaveSession_year_key";

-- AlterTable
ALTER TABLE "LeaveSession" DROP COLUMN "year";
