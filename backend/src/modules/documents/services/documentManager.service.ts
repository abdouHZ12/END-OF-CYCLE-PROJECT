import { prisma } from '../../../lib/prisma.js';
import { httpError } from '../../../common/errors.js';
import { toInt } from '../../../common/parsing.js';

async function getManagerStructureId(managerId: number): Promise<number> {
  const manager = await prisma.employee.findUnique({
    where: { id: managerId },
    select: { structureId: true },
  });

  if (!manager) throw httpError(404, 'Manager not found');
  if (!manager.structureId) throw httpError(400, 'Manager structure not found');
  return manager.structureId;
}

export const ReadPendingDocumentsForManager = async (data: any) => {
  const managerId = toInt(data?.ManagerId, 'ManagerId');
  const structureId = await getManagerStructureId(managerId);

  return prisma.document.findMany({
    where: {
      status: 'PENDING',
      issuedById: { not: managerId },
      employee: {
        structureId,
      },
    },
    include: {
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      employee: {
        select: { id: true, name: true, username: true },
      },
    },
  });
};

export const ReadEmployeesHistoryForManager = async (data: any) => {
  const managerId = toInt(data?.ManagerId, 'ManagerId');
  const structureId = await getManagerStructureId(managerId);

  return prisma.employee.findMany({
    where: {
      structureId,
      id: { not: managerId },
      roles: { some: { role: { type: 'WORKER' } } },
    },
    select: {
      id: true,
      name: true,
      username: true,
      issuedDocuments: {
        include: {
          missionOrder: true,
          absenceAuth: true,
          exitSlip: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

export const ReadManagerDashboardStats = async (data: any) => {
  const managerId = toInt(data?.ManagerId, 'ManagerId');
  const structureId = await getManagerStructureId(managerId);

  const teamDocs = await prisma.document.findMany({
    where: {
      issuedById: { not: managerId },
      employee: { structureId },
    },
    include: {
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      employee: {
        select: { id: true, name: true, username: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = teamDocs.length;
  const pending = teamDocs.filter((d) => d.status === 'PENDING').length;
  const approved = teamDocs.filter((d) => d.status === 'APPROVED').length;
  const rejected = teamDocs.filter((d) => d.status === 'REJECTED').length;
  const recentDocuments = teamDocs.slice(0, 5);

  return { total, pending, approved, rejected, recentDocuments };
};
