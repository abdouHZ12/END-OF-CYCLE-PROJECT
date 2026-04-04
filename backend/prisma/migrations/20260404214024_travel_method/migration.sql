-- CreateEnum
CREATE TYPE "TravelMethodType" AS ENUM ('PERSONAL', 'COMPANY', 'AIRPLANE');

-- AlterTable
ALTER TABLE "MissionOrder" ADD COLUMN     "transportMethod" "TravelMethodType" NOT NULL DEFAULT 'PERSONAL';
