/*
  Warnings:

  - The primary key for the `AbsenceAuth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DocumentId` on the `AbsenceAuth` table. All the data in the column will be lost.
  - You are about to drop the column `EndDate` on the `AbsenceAuth` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `AbsenceAuth` table. All the data in the column will be lost.
  - You are about to drop the column `Reason` on the `AbsenceAuth` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `AbsenceAuth` table. All the data in the column will be lost.
  - The primary key for the `Document` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `AuthIssuedAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedAT` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `EmployeeId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `QrCode` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `Document` table. All the data in the column will be lost.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `RoleId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `StructureId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `Username` on the `Employee` table. All the data in the column will be lost.
  - The primary key for the `ExitSlip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DocumentId` on the `ExitSlip` table. All the data in the column will be lost.
  - You are about to drop the column `ExitTime` on the `ExitSlip` table. All the data in the column will be lost.
  - You are about to drop the column `Gate` on the `ExitSlip` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `ExitSlip` table. All the data in the column will be lost.
  - You are about to drop the column `ReturnTime` on the `ExitSlip` table. All the data in the column will be lost.
  - The primary key for the `MissionOrder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Destination` on the `MissionOrder` table. All the data in the column will be lost.
  - You are about to drop the column `DocumentId` on the `MissionOrder` table. All the data in the column will be lost.
  - You are about to drop the column `Duration` on the `MissionOrder` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `MissionOrder` table. All the data in the column will be lost.
  - You are about to drop the column `Purpose` on the `MissionOrder` table. All the data in the column will be lost.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `Permissions` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `Structure` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Structure` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Structure` table. All the data in the column will be lost.
  - You are about to drop the column `ParentId` on the `Structure` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `AbsenceAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[documentId]` on the table `ExitSlip` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[documentId]` on the table `MissionOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentId` to the `AbsenceAuth` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `AbsenceAuth` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `AbsenceAuth` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `AbsenceAuth` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrCode` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structureId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentId` to the `ExitSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exitTime` to the `ExitSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gate` to the `ExitSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnTime` to the `ExitSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `MissionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentId` to the `MissionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `MissionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `MissionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permissions` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Structure` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'MANAGER', 'WORKER', 'AGENT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MISSION_ORDER', 'ABSENCE_AUTH', 'EXIT_SLIP');

-- DropForeignKey
ALTER TABLE "AbsenceAuth" DROP CONSTRAINT "AbsenceAuth_DocumentId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_EmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_RoleId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_StructureId_fkey";

-- DropForeignKey
ALTER TABLE "ExitSlip" DROP CONSTRAINT "ExitSlip_DocumentId_fkey";

-- DropForeignKey
ALTER TABLE "MissionOrder" DROP CONSTRAINT "MissionOrder_DocumentId_fkey";

-- DropForeignKey
ALTER TABLE "Structure" DROP CONSTRAINT "Structure_ParentId_fkey";

-- DropIndex
DROP INDEX "AbsenceAuth_DocumentId_key";

-- DropIndex
DROP INDEX "Employee_Username_key";

-- DropIndex
DROP INDEX "ExitSlip_DocumentId_key";

-- DropIndex
DROP INDEX "MissionOrder_DocumentId_key";

-- AlterTable
ALTER TABLE "AbsenceAuth" DROP CONSTRAINT "AbsenceAuth_pkey",
DROP COLUMN "DocumentId",
DROP COLUMN "EndDate",
DROP COLUMN "Id",
DROP COLUMN "Reason",
DROP COLUMN "StartDate",
ADD COLUMN     "documentId" INTEGER NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "AbsenceAuth_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Document" DROP CONSTRAINT "Document_pkey",
DROP COLUMN "AuthIssuedAt",
DROP COLUMN "CreatedAT",
DROP COLUMN "EmployeeId",
DROP COLUMN "Id",
DROP COLUMN "QrCode",
DROP COLUMN "Status",
ADD COLUMN     "authIssuedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "qrCode" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "type" "DocumentType" NOT NULL,
ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
DROP COLUMN "Id",
DROP COLUMN "Name",
DROP COLUMN "Password",
DROP COLUMN "RoleId",
DROP COLUMN "StructureId",
DROP COLUMN "Username",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "roleId" INTEGER NOT NULL,
ADD COLUMN     "structureId" INTEGER NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ExitSlip" DROP CONSTRAINT "ExitSlip_pkey",
DROP COLUMN "DocumentId",
DROP COLUMN "ExitTime",
DROP COLUMN "Gate",
DROP COLUMN "Id",
DROP COLUMN "ReturnTime",
ADD COLUMN     "documentId" INTEGER NOT NULL,
ADD COLUMN     "exitTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gate" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "returnTime" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "ExitSlip_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MissionOrder" DROP CONSTRAINT "MissionOrder_pkey",
DROP COLUMN "Destination",
DROP COLUMN "DocumentId",
DROP COLUMN "Duration",
DROP COLUMN "Id",
DROP COLUMN "Purpose",
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "documentId" INTEGER NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "purpose" TEXT NOT NULL,
ADD CONSTRAINT "MissionOrder_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "Id",
DROP COLUMN "Name",
DROP COLUMN "Permissions",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "permissions" TEXT NOT NULL,
ADD COLUMN     "type" "RoleType" NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Structure" DROP CONSTRAINT "Structure_pkey",
DROP COLUMN "Id",
DROP COLUMN "Name",
DROP COLUMN "ParentId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentId" INTEGER,
ADD CONSTRAINT "Structure_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "AbsenceAuth_documentId_key" ON "AbsenceAuth"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ExitSlip_documentId_key" ON "ExitSlip"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionOrder_documentId_key" ON "MissionOrder"("documentId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionOrder" ADD CONSTRAINT "MissionOrder_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceAuth" ADD CONSTRAINT "AbsenceAuth_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitSlip" ADD CONSTRAINT "ExitSlip_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
