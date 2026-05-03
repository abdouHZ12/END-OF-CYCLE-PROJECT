import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { sendResetEmail } from '../../lib/mailer.js';
import { tokenService } from './token.service.js';
import { generateResetToken } from '../../lib/token.js';

const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 10);
const comparePassword = (raw: string, hashed: string): Promise<boolean> => bcrypt.compare(raw, hashed);
const hashToken = (token: string): Promise<string> => bcrypt.hash(token, 10);
const compareToken = (raw: string, hashed: string): Promise<boolean> => bcrypt.compare(raw, hashed);

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const authService = {
  async signIn(username: string, password: string) {
    const employee = await prisma.employee.findUnique({
      where: { username },
      include: { roles: { include: { role: true } } },
    });

    if (!employee || !(await comparePassword(password, employee.password))) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const roleTypes = employee.roles.map((er) => er.role.type);
    const accessToken = tokenService.generateAccessToken(employee.id, roleTypes);
    const refreshToken = tokenService.generateRefreshToken(employee.id);

    await prisma.employee.update({
      where: { id: employee.id },
      data: { refreshToken: await hashToken(refreshToken) },
    });

    return {
      accessToken,
      refreshToken,
      employee: {
        id: employee.id,
        name: employee.name,
        username: employee.username,
        roles: roleTypes,
      },
    };
  },

  async signInAgent(username: string, password: string) {
  const employee = await prisma.employee.findUnique({
    where: { username },
    include: { roles: { include: { role: true } } },
  });
  if (!employee || !(await comparePassword(password, employee.password))) {
    throw new Error('INVALID_CREDENTIALS');
  }
  const roleTypes = employee.roles.map((er) => er.role.type);
  if (!roleTypes.includes('AGENT')) {
    throw new Error('NOT_AGENT');
  }
  const accessToken = tokenService.generateAccessToken(employee.id, roleTypes);
  const refreshToken = tokenService.generateRefreshToken(employee.id);
  await prisma.employee.update({
    where: { id: employee.id },
    data: { refreshToken: await hashToken(refreshToken) },
  });
  return {
    accessToken,
    refreshToken,
    employee: {
      id: employee.id,
      name: employee.name,
      username: employee.username,
      roles: roleTypes,
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
      include: { roles: { include: { role: true } } },
    });

    if (!employee?.refreshToken) throw new Error('INVALID_REFRESH_TOKEN');

    if (!(await compareToken(refreshToken, employee.refreshToken))) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const roleTypes = employee.roles.map((er) => er.role.type);

    return {
      accessToken: tokenService.generateAccessToken(employee.id, roleTypes),
    };
  },

  async forgotPassword(email: string) {
    const employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee) return; 

    await prisma.passwordReset.deleteMany({ where: { employeeId: employee.id } });

    const rawToken = generateResetToken();
    const hashedToken = await hashToken(rawToken);

    await prisma.passwordReset.create({
      data: {
        token: hashedToken,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
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
      if (await compareToken(token, record.token)) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) throw new Error('INVALID_RESET_TOKEN');

    await prisma.employee.update({
      where: { id: matchedRecord.employeeId },
      data: { password: await hashPassword(newPassword) },
    });

    await prisma.passwordReset.delete({ where: { id: matchedRecord.id } });
  },
};