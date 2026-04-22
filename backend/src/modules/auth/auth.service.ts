import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { sendResetEmail } from '../../lib/mailer.js';
import { tokenService } from './token.service.js';

export const authService = {
  async signIn(username: string, password: string) {
    const employee = await prisma.employee.findUnique({
      where: { username },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!employee) throw new Error('INVALID_CREDENTIALS');

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) throw new Error('INVALID_CREDENTIALS');

    const roleTypes = employee.roles.map(er => er.role.type);

    const accessToken = tokenService.generateAccessToken(employee.id, roleTypes);
    const refreshToken = tokenService.generateRefreshToken(employee.id);
    const hashedRefreshToken = await tokenService.hashToken(refreshToken);

    await prisma.employee.update({
      where: { id: employee.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
      employee: {
        id: employee.id,
        name: employee.name,
        username: employee.username,
        roles: roleTypes,           // array instead of single role
      },
    };
  },

  async signOut(refreshToken: string) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    await prisma.employee.update({
      where: { id: payload.id },
      data: { refreshToken: null },
    });
  },

  async refreshToken(refreshToken: string) {
    const payload = tokenService.verifyRefreshToken(refreshToken);

    const employee = await prisma.employee.findUnique({
      where: { id: payload.id },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!employee || !employee.refreshToken) throw new Error('INVALID_REFRESH_TOKEN');

    const isValid = await tokenService.compareToken(refreshToken, employee.refreshToken);
    if (!isValid) throw new Error('INVALID_REFRESH_TOKEN');

    const roleTypes = employee.roles.map(er => er.role.type);

    return {
      accessToken: tokenService.generateAccessToken(employee.id, roleTypes),
    };
  },

  async forgotPassword(email: string) {
    const employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee) return;

    await prisma.passwordReset.deleteMany({
      where: { employeeId: employee.id },
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await tokenService.hashToken(rawToken);

    await prisma.passwordReset.create({
      data: {
        token: hashedToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        employeeId: employee.id,
      },
    });

    await sendResetEmail(employee.email, employee.name, rawToken);
  },

  async resetPassword(token: string, newPassword: string) {
    if (newPassword.length < 8) throw new Error('PASSWORD_TOO_SHORT');

    const resetRecords = await prisma.passwordReset.findMany({
      where: { expiresAt: { gt: new Date() } },
    });

    let matchedRecord = null;
    for (const record of resetRecords) {
      const isMatch = await tokenService.compareToken(token, record.token);
      if (isMatch) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) throw new Error('INVALID_RESET_TOKEN');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.employee.update({
      where: { id: matchedRecord.employeeId },
      data: { password: hashedPassword },
    });

    await prisma.passwordReset.delete({
      where: { id: matchedRecord.id },
    });
  },
};