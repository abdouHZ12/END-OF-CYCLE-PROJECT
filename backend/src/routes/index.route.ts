// src/routes/index.route.ts
import { Router } from 'express';
import authRouter from './auth.route.js';
import documentRouter from './Document.route.js';
import adminRouter from './admin.route.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/documents', documentRouter);
router.use('/admin', adminRouter);

export default router;