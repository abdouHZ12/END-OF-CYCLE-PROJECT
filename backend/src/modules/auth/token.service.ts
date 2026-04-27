import jwt from 'jsonwebtoken';
import { config } from '../../config/config.js';
import type { RoleType } from '../../../generated/prisma/client.js';

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
      { expiresIn: config.jwt.refreshExpires },
    );
  },

  verifyAccessToken(token: string): { id: number; roles: RoleType[] } {
    return jwt.verify(token, config.jwt.accessSecret) as { id: number; roles: RoleType[] };
  },

  verifyRefreshToken(token: string): { id: number } {
    return jwt.verify(token, config.jwt.refreshSecret) as { id: number };
  },
};