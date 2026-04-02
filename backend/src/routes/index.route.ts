import { Router } from 'express';
import authRouter from './auth.route.js';

const router: ReturnType<typeof Router> = Router();

router.use('/auth', authRouter);


export default router;