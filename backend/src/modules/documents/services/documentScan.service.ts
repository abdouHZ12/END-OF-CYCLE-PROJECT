import { prisma } from '../../../lib/prisma.js';
import { httpError } from '../../../common/errors.js';

export const GetAllSessions = async () => {
  return prisma.leaveSession.findMany({
    orderBy: { leaveTime: 'desc' },
    include: {
      document: {
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              structure: {
                select: { id: true, name: true },
              },
            },
          },
          missionOrder: true,
          absenceAuth: true,
          exitSlip: true,
        },
      },
    },
  });
};

export const ScanDocument = async (token: any, agentDeviceId: string) => {
  if (typeof token !== 'string' || !token.trim()) {
    throw httpError(400, 'token is required');
  }

  const document = await prisma.document.findUnique({
    where: { qrCode: token },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          structure: { select: { id: true, name: true } },
        },
      },
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      leaveSession: true,
      decisionMadeBy: { select: { id: true, name: true, username: true } },
    },
  });

  if (!document) throw httpError(400, 'Invalid QR code');

  const now = new Date();
  let session = await prisma.leaveSession.findUnique({
    where: { documentId: document.id },
  });

  if (document.status === 'APPROVED') {
    // First scan — record leave time
    if (!session) {
      try {
        session = await prisma.leaveSession.create({
          data: {
            documentId: document.id,
            status: 'OUT',
            employeeId: document.issuedById,
            leaveTime: now,
            agentDeviceId,
          },
        });
      } catch (err: any) {
        if (err?.code === 'P2002') {
          session = await prisma.leaveSession.findUnique({
            where: { documentId: document.id },
          });
        } else {
          throw err;
        }
      }

      const refreshedDocument = await prisma.document.findUnique({
        where: { id: document.id },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              structure: { select: { id: true, name: true } },
            },
          },
          missionOrder: true,
          absenceAuth: true,
          exitSlip: true,
          leaveSession: true,
          decisionMadeBy: { select: { id: true, name: true, username: true } },
        },
      });

      return { message: 'QR code Valid , leave time created', Document: refreshedDocument };
    }

    // Second scan — record return time
    if (!session.returnTime) {
      if (document.type === 'EXIT_SLIP') {
        const hour = now.getHours();
        if (hour >= 16) {
          await prisma.leaveSession.update({
            where: { id: session.id },
            data: { status: 'NOT_RETURNED', agentDeviceId },
          });

          const refreshedDocument = await prisma.document.findUnique({
            where: { id: document.id },
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  structure: { select: { id: true, name: true } },
                },
              },
              missionOrder: true,
              absenceAuth: true,
              exitSlip: true,
              leaveSession: true,
              decisionMadeBy: { select: { id: true, name: true, username: true } },
            },
          });

          return {
            message: "Too late it's past 16:00 -> marked as NOT_RETURNED",
            Document: refreshedDocument,
          };
        }
      }

      await prisma.leaveSession.update({
        where: { id: session.id },
        data: { returnTime: now, status: 'RETURNED', agentDeviceId },
      });

      const refreshedDocument = await prisma.document.findUnique({
        where: { id: document.id },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              structure: { select: { id: true, name: true } },
            },
          },
          missionOrder: true,
          absenceAuth: true,
          exitSlip: true,
          leaveSession: true,
          decisionMadeBy: { select: { id: true, name: true, username: true } },
        },
      });

      return { message: 'QR code Valid , return time recorded', Document: refreshedDocument };
    }
  }

  // Already completed
  const refreshedDocument = await prisma.document.findUnique({
    where: { id: document.id },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          structure: { select: { id: true, name: true } },
        },
      },
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      leaveSession: true,
      decisionMadeBy: { select: { id: true, name: true, username: true } },
    },
  });

  return { message: 'QR code Valid , Already completed', Document: refreshedDocument };
};
