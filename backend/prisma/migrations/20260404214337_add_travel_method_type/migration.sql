/*
  Warnings:

  - You are about to drop the column `transportMethod` on the `MissionOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MissionOrder" DROP COLUMN "transportMethod",
ADD COLUMN     "travelMethod" "TravelMethodType" NOT NULL DEFAULT 'PERSONAL';
