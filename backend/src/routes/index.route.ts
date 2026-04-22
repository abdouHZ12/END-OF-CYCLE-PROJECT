import { Router } from 'express';
import authRouter from './auth.route.js';
import DocumentRouter from './Document.route.js'
import adminRouter from './admin.route.js'; 

const router: ReturnType<typeof Router> = Router();

router.use('/auth', authRouter);
router.use('/',DocumentRouter);
router.use('/admin', adminRouter);


export default router;