import { Router } from 'express';
import * as NotificationController from '../modules/notifications/notification.controller.js';

const router: Router = Router();

router.get('/notifications/:employeeId', NotificationController.GetNotifications);
router.get('/notifications/:employeeId/unread-count', NotificationController.GetUnreadCount);
router.patch('/notifications/:employeeId/:id/read', NotificationController.MarkOneAsRead);
router.patch('/notifications/:employeeId/read-all', NotificationController.MarkAllAsRead);

export default router;