import type { Request, Response, NextFunction } from 'express';
import { tokenService } from '../modules/auth/token.service.js';
import type { RoleType } from '../../generated/prisma/browser.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: { id: number; roles: RoleType[] }; 
    }
}

export function auth(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.headers['authorization'];
    console.log("AUTH HEADER:", authHeader);
    if(!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = tokenService.verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
    return

}