import type { Request, Response } from 'express';
import * as NotificationService from './notification.service.js';
import { toInt } from '../../common/parsing.js';

export const GetNotifications = async (req: Request, res: Response) => {
  try {
    const employeeId = toInt(req.params.employeeId, 'employeeId');
    const notifications = await NotificationService.getNotificationsForEmployee(employeeId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error, message: 'failed to fetch notifications' });
  }
};

export const GetUnreadCount = async (req: Request, res: Response) => {
  try {
    const employeeId = toInt(req.params.employeeId, 'employeeId');
    const count = await NotificationService.getUnreadCount(employeeId);
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error, message: 'failed to fetch unread count' });
  }
};

export const MarkOneAsRead = async (req: Request, res: Response) => {
  try {
    const notificationId = toInt(req.params.id, 'id');
    const employeeId = toInt(req.params.employeeId, 'employeeId');
    const result = await NotificationService.markOneAsRead(notificationId, employeeId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error, message: 'failed to mark notification as read' });
  }
};

export const MarkAllAsRead = async (req: Request, res: Response) => {
  try {
    const employeeId = toInt(req.params.employeeId, 'employeeId');
    const result = await NotificationService.markAllAsRead(employeeId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error, message: 'failed to mark all notifications as read' });
  }
};