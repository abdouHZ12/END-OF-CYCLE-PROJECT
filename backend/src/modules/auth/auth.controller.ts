import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

const isError = (err: unknown, message: string): boolean =>
  err instanceof Error && err.message === message;

const isJwtError = (err: unknown): boolean =>
  err instanceof Error && err.name === 'JsonWebTokenError';

export const authController = {
  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }
      const result = await authService.signIn(username, password);
      res.status(200).json({ message: 'Signed in successfully', ...result });
    } catch (err) {
      if (isError(err, 'INVALID_CREDENTIALS')) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
      if (isError(err, 'NOT_AGENT')) {
        res.status(403).json({ message: 'Access denied: agent role required' });
        return;
      }
      next(err);
    }
  },

  async signInAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }
    const result = await authService.signInAgent(username, password);
    res.status(200).json({ message: 'Signed in successfully', ...result });
  } catch (err) {
    if (isError(err, 'INVALID_CREDENTIALS')) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    if (isError(err, 'NOT_AGENT')) {
      res.status(403).json({ message: 'Access denied: agent role required' });
      return;
    }
    next(err);
  }
},

  async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }
      await authService.signOut(refreshToken);
      res.status(200).json({ message: 'Signed out successfully' });
    } catch (err) {
      if (isJwtError(err)) {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }
      next(err);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (err) {
      if (isError(err, 'INVALID_REFRESH_TOKEN') || isJwtError(err)) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }
      await authService.forgotPassword(email);
      res.status(200).json({ message: 'If this email exists, a reset link has been sent' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(400).json({ message: 'Token and new password are required' });
        return;
      }
      await authService.resetPassword(token, newPassword);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      if (isError(err, 'PASSWORD_TOO_SHORT')) {
        res.status(400).json({ message: 'Password must be at least 8 characters' });
        return;
      }
      if (isError(err, 'INVALID_RESET_TOKEN')) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
      }
      next(err);
    }
  },
};