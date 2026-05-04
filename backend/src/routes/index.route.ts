import { Router } from 'express';
import authRouter from './auth.route.js';
import documentRouter from './Document.route.js';
import adminRouter from './admin.route.js';
import employeeRouter from './employee.route.js';
import notificationRouter from './notification.route.js';  // ← add this

const router = Router();

router.use('/auth', authRouter);
router.use('/', documentRouter);
router.use('/', employeeRouter);
router.use('/admin', adminRouter);
router.use('/', notificationRouter);  // ← add this

export default router;