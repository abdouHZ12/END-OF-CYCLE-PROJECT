import type { Request, Response, NextFunction } from 'express';
import { tokenService } from '../modules/auth/token.service.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: { id: number; role: string }; // Adjust the type based on your token payload
    }
}

export function auth(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.headers['authorization'];
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