import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

export const authController = {

    async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const result = await authService.signIn(username, password);
            return res.status(200).json({ message: 'Signed in successfully', ...result });
        } 
        catch (error: any) {
            if (error.message === 'INVALID_CREDENTIALS') {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            next(error);
        }
    },  

    async signOut(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token is required' });
            }

            await authService.signOut(refreshToken);
            return res.status(200).json({ message: 'Signed out successfully' });
        } 
        catch (error: any) {
            if (error.message === 'invalid signature' || error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            }
            next(error);
        }
    },

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token is required' });
            }

            const result = await authService.refreshToken(refreshToken);
            return res.status(200).json(result);
        } 
        catch (error: any) {
            if (error.message === 'INVALID_REFRESH_TOKEN' || error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid or expired refresh token' });
            }
            next(error);
        }
    },

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            await authService.forgotPassword(email);
            return res.status(200).json({
                message: 'If this email exists, a reset link has been sent',
            });
        } 
        catch (error) {
            next(error);
        }
    },


    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token and new password are required' });
            }

            await authService.resetPassword(token, newPassword);
            return res.status(200).json({ message: 'Password reset successfully' });
        } 
        catch (error: any) {
            if (error.message === 'PASSWORD_TOO_SHORT') {
                return res.status(400).json({ message: 'Password must be at least 8 characters' });
            }
            if (error.message === 'INVALID_RESET_TOKEN') {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }
            next(error);
        }
    },
    
}
