/*
  Warnings:

  - You are about to drop the column `roleId` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_roleId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "roleId";

-- CreateTable
CREATE TABLE "EmployeeRole" (
    "employeeId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeRole_pkey" PRIMARY KEY ("employeeId","roleId")
);

-- CreateIndex
CREATE INDEX "EmployeeRole_employeeId_idx" ON "EmployeeRole"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeRole_roleId_idx" ON "EmployeeRole"("roleId");

-- AddForeignKey
ALTER TABLE "EmployeeRole" ADD CONSTRAINT "EmployeeRole_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRole" ADD CONSTRAINT "EmployeeRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
