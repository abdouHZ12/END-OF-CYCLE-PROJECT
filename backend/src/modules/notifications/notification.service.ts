import { prisma } from '../../lib/prisma.js';
import { NotifType, Prisma } from '../../../generated/prisma/client.js';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createNotification = async ({
  recipientId,
  type,
  message,
  metadata,
}: {
  recipientId: number;
  type: NotifType;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) => {
  return prisma.notification.create({
    data: {
      recipientId,
      type,
      message,
      metadata: metadata ?? {},
    },
  });
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getNotificationsForEmployee = async (employeeId: number) => {
  return prisma.notification.findMany({
    where: { recipientId: employeeId },
    orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
  });
};

export const getUnreadCount = async (employeeId: number) => {
  return prisma.notification.count({
    where: { recipientId: employeeId, read: false },
  });
};

// ─── Mark as read ─────────────────────────────────────────────────────────────

export const markOneAsRead = async (notificationId: number, employeeId: number) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, recipientId: employeeId },
    data: { read: true },
  });
};

export const markAllAsRead = async (employeeId: number) => {
  return prisma.notification.updateMany({
    where: { recipientId: employeeId, read: false },
    data: { read: true },
  });
};