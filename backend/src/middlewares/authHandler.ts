import type { Request, Response, NextFunction } from 'express';
import { tokenService } from '../modules/auth/token.service.js';
import type { RoleType } from '../../generated/prisma/browser.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; roles: RoleType[] };
  }
}

export function auth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    req.user = tokenService.verifyAccessToken(token);
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}