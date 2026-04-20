import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config/config.js';
import { RoleType } from '../../../generated/prisma/client.js';

export const tokenService = {
  generateAccessToken(employeeId: number, roles: RoleType[]): string {
    return jwt.sign(
      { id: employeeId, roles },
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

  verifyAccessToken(token: string): { id: number; roles: RoleType[] } {
    return jwt.verify(token, config.jwt.accessSecret) as { id: number; roles: RoleType[] };
  },

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  },

  async compareToken(raw: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(raw, hashed);
  },
};