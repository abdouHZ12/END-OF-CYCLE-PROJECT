import { Router } from 'express';
import { authController } from '../modules/auth/auth.controller.js';

const router: ReturnType<typeof Router> = Router();

router.post('/signin',          authController.signIn);
router.post('/signout',         authController.signOut);
router.post('/refresh-token',   authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);

export default router;