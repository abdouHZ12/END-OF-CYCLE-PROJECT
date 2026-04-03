import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config/config.js';

export const tokenService = {

    generateAccessToken(employeeId: number, role: string): string {
        return jwt.sign(
            { id: employeeId, role},
            config.jwt.accessSecret,
            { expiresIn: config.jwt.accessExpires },
        );
    },

    generateRefreshToken(employeeId: number): string {
        return jwt.sign(
            { id: employeeId },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpires }
        );
    },

    verifyRefreshToken(token: string): { id: number } {
        return jwt.verify(token, config.jwt.refreshSecret) as { id: number };
    },

    verifyAccessToken(token: string): { id: number; role: string } {
        return jwt.verify(token, config.jwt.accessSecret) as { id: number; role: string };
    },

    async hashToken(token: string): Promise<string> {
        return bcrypt.hash(token, 10);
    },

    async compareToken(raw: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(raw, hashed);
    },
}