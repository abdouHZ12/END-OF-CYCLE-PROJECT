import { Router } from 'express';
import authRouter from './auth.route.js';
import DocumentRouter from './Document.route.js'

const router: ReturnType<typeof Router> = Router();

router.use('/auth', authRouter);
router.use('/',DocumentRouter);



export default router;