import { prisma } from '../../../lib/prisma.js';
import { generateResetToken } from '../../../lib/token.js';
import { httpError } from '../../../common/errors.js';
import { toInt } from '../../../common/parsing.js';
import { getEmployeeRoleTypes } from '../../employees/employeeRoles.service.js';
import { RoleType } from '../../../../generated/prisma/client.js';

const documentInclude = {
  missionOrder: true,
  absenceAuth: true,
  exitSlip: true,
  decisionMadeBy: {
    select: { id: true, name: true, username: true },
  },
} as const;

// Creation
export const CreateExitSlip = async (data: any) => {
  const { Qrcode, Type, EmployeeId, exitTime, returnTime, gate } = data;

  const employeeIdNum = toInt(EmployeeId, 'EmployeeId');
  await getEmployeeRoleTypes(employeeIdNum);

  return prisma.document.create({
    data: {
      qrCode: Qrcode,
      type: Type,
      issuedById: employeeIdNum,
      exitSlip: {
        create: {
          exitTime,
          returnTime,
          gate,
        },
      },
    },
  });
};

export const CreateAbsenceAuth = async (data: any) => {
  const { Qrcode, Type, EmployeeId, startDate, endDate, reason } = data;

  const employeeIdNum = toInt(EmployeeId, 'EmployeeId');
  await getEmployeeRoleTypes(employeeIdNum);

  return prisma.document.create({
    data: {
      qrCode: Qrcode,
      type: Type,
      issuedById: employeeIdNum,
      absenceAuth: {
        create: {
          startDate,
          endDate,
          reason,
        },
      },
    },
  });
};

export const CreateMissionOrder = async (data: any) => {
  const { Qrcode, Type, EmployeeId, assignedToId, destination, duration, purpose, travelMethod } = data;

  const managerId = toInt(EmployeeId, 'EmployeeId (managerId)');

  if (Type !== 'MISSION_ORDER') {
    throw httpError(400, 'Invalid Type for Mission Order');
  }

  const managerRoles = await getEmployeeRoleTypes(managerId);
  const isManagerOrAdmin = managerRoles.includes(RoleType.MANAGER) || managerRoles.includes(RoleType.ADMIN);
  if (!isManagerOrAdmin) {
    throw httpError(403, 'Only MANAGER/ADMIN users can assign Mission Orders');
  }

  const assignedEmployeeId = toInt(assignedToId, 'assignedToId');

  const assignedRoles = await getEmployeeRoleTypes(assignedEmployeeId);
  const isWorker = assignedRoles.includes(RoleType.WORKER);
  if (!isWorker) {
    throw httpError(400, 'assignedToId must be a WORKER');
  }

  return prisma.document.create({
    data: {
      qrCode: Qrcode,
      type: Type,
      status: 'APPROVED',
      authIssuedAt: new Date(),
      issuedById: assignedEmployeeId,
      decisionMadeById: managerId,
      missionOrder: {
        create: {
          travelMethod,
          destination,
          duration,
          purpose,
        },
      },
    },
  });
};

// Read
export const ReadAllDocuments = async (id: any) => {
  const employeeId = toInt(id, 'id');

  return prisma.document.findMany({
    where: { issuedById: employeeId },
    include: documentInclude,
  });
};

export const ReadAllDocumentByState = async (data: any) => {
  const { state, EmployeeId } = data;
  const employeeId = toInt(EmployeeId, 'EmployeeId');

  return prisma.document.findMany({
    where: {
      issuedById: employeeId,
      status: state,
    },
    include: documentInclude,
  });
};

export const ReadDocumentById = async (_data: any, id: any, employeeId: any) => {
  const documentId = toInt(id, 'id');
  const issuedById = toInt(employeeId, 'employeeId');

  return prisma.document.findUnique({
    where: {
      issuedById,
      id: documentId,
    },
    include: documentInclude,
  });
};

export const ReadAllDocumentByType = async (data: any) => {
  const { Type, EmployeeId } = data;
  const employeeId = toInt(EmployeeId, 'EmployeeId');

  return prisma.document.findMany({
    where: {
      issuedById: employeeId,
      type: Type,
    },
    include: documentInclude,
  });
};

export const ReadAllDocumentByStatusAndType = async (data: any) => {
  const { state, Type, EmployeeId } = data;
  const employeeId = toInt(EmployeeId, 'EmployeeId');

  return prisma.document.findMany({
    where: {
      issuedById: employeeId,
      type: Type,
      status: state,
    },
    include: documentInclude,
  });
};

// Update
export const UpdateDocumentState = async (data: any, id: any) => {
  const documentId = toInt(id, 'id');
  const issueDate: Date = new Date();

  const { state, ManagerId, managerComment, comment } = data;

  const rawComment =
    typeof managerComment === 'string'
      ? managerComment
      : typeof comment === 'string'
        ? comment
        : undefined;
  const normalizedComment = rawComment?.trim() ? rawComment.trim() : null;

  if (state === 'APPROVED') {
    const token = generateResetToken();
    await prisma.document.update({
      where: { id: documentId },
      data: { qrCode: token },
    });
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      authIssuedAt: issueDate,
      status: state,
      decisionMadeBy: {
        connect: { id: toInt(ManagerId, 'ManagerId') },
      },
      managerComment: normalizedComment,
    } as any,
  });
};

export const UpdateWholeExitSlip = async (data: any, id: any) => {
  const documentId = toInt(id, 'id');
  const { Qrcode, Type, exitTime, returnTime, gate } = data;

  return prisma.document.update({
    where: { id: documentId },
    data: {
      qrCode: Qrcode,
      type: Type,
      exitSlip: {
        update: {
          exitTime,
          returnTime,
          gate,
        },
      },
    },
  });
};

export const UpdateWholeAbsenceAuth = async (data: any, id: any) => {
  const documentId = toInt(id, 'id');
  const { Qrcode, Type, startDate, endDate, reason } = data;

  return prisma.document.update({
    where: { id: documentId },
    data: {
      qrCode: Qrcode,
      type: Type,
      absenceAuth: {
        update: {
          startDate,
          endDate,
          reason,
        },
      },
    },
  });
};

export const UpdateWholeMissionOrder = async (data: any, id: any) => {
  const documentId = toInt(id, 'id');
  const { Qrcode, Type, destination, duration, purpose, travelMethod } = data;

  return prisma.document.update({
    where: { id: documentId },
    data: {
      qrCode: Qrcode,
      type: Type,
      missionOrder: {
        update: {
          travelMethod,
          destination,
          duration,
          purpose,
        },
      },
    },
  });
};

// Delete
export const DeleteDocumentById = async (data: any, employeeId: any) => {
  const documentId = toInt(data, 'id');
  const issuedById = toInt(employeeId, 'employeeId');

  return prisma.document.delete({
    where: { id: documentId, issuedById },
  });
};
