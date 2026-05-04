import { prisma } from '../../lib/prisma.js';
import { createNotification } from './notification.service.js';
import { NotifType } from '../../../generated/prisma/client.js';

export const checkExpiringExitSlips = async () => {
  const now = new Date();
  const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

  const expiring = await prisma.exitSlip.findMany({
    where: {
      returnTime: { gte: now, lte: in30Minutes },
      document: { status: 'APPROVED' },
    },
    include: { document: true },
  });

  for (const slip of expiring) {
    const doc = slip.document;
    if (!doc.issuedById) continue;

    const alreadyNotified = await prisma.notification.findFirst({
      where: {
        recipientId: doc.issuedById,
        type: NotifType.DOCUMENT_EXPIRING,
        metadata: { path: ['documentId'], equals: doc.id },
      },
    });

    if (!alreadyNotified) {
      await createNotification({
        recipientId: doc.issuedById,
        type: NotifType.DOCUMENT_EXPIRING,
        message: 'Your exit slip is expiring in less than 30 minutes. Please return before the deadline.',
        metadata: { documentId: doc.id, docType: 'EXIT_SLIP' },
      });
    }
  }
};

export const cleanOldNotifications = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  await prisma.notification.deleteMany({
    where: {
      read: true,
      createdAt: { lt: cutoff },
    },
  });
};