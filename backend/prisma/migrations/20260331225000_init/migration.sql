-- CreateTable
CREATE TABLE "Employee" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "RoleId" INTEGER NOT NULL,
    "StructureId" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Structure" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "ParentId" INTEGER,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Role" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Permissions" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Document" (
    "Id" SERIAL NOT NULL,
    "Status" TEXT NOT NULL,
    "CreatedAT" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "QrCode" TEXT NOT NULL,
    "AuthIssuedAt" TIMESTAMP(3),
    "EmployeeId" INTEGER NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "MissionOrder" (
    "Id" SERIAL NOT NULL,
    "Destination" TEXT NOT NULL,
    "Duration" INTEGER NOT NULL,
    "Purpose" TEXT NOT NULL,
    "DocumentId" INTEGER NOT NULL,

    CONSTRAINT "MissionOrder_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AbsenceAuth" (
    "Id" SERIAL NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "Reason" TEXT NOT NULL,
    "DocumentId" INTEGER NOT NULL,

    CONSTRAINT "AbsenceAuth_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ExitSlip" (
    "Id" SERIAL NOT NULL,
    "ExitTime" TIMESTAMP(3) NOT NULL,
    "ReturnTime" TIMESTAMP(3) NOT NULL,
    "Gate" TEXT NOT NULL,
    "DocumentId" INTEGER NOT NULL,

    CONSTRAINT "ExitSlip_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_Username_key" ON "Employee"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "MissionOrder_DocumentId_key" ON "MissionOrder"("DocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "AbsenceAuth_DocumentId_key" ON "AbsenceAuth"("DocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExitSlip_DocumentId_key" ON "ExitSlip"("DocumentId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "Role"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_StructureId_fkey" FOREIGN KEY ("StructureId") REFERENCES "Structure"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_ParentId_fkey" FOREIGN KEY ("ParentId") REFERENCES "Structure"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_EmployeeId_fkey" FOREIGN KEY ("EmployeeId") REFERENCES "Employee"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionOrder" ADD CONSTRAINT "MissionOrder_DocumentId_fkey" FOREIGN KEY ("DocumentId") REFERENCES "Document"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceAuth" ADD CONSTRAINT "AbsenceAuth_DocumentId_fkey" FOREIGN KEY ("DocumentId") REFERENCES "Document"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitSlip" ADD CONSTRAINT "ExitSlip_DocumentId_fkey" FOREIGN KEY ("DocumentId") REFERENCES "Document"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
