import { prisma } from './prisma.js';
import crypto from 'crypto';

export const generateUsername = async (fullName: string): Promise<string> => {
  const base = fullName
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((part, i) => (i === 0 ? part : part[0]))
    .join('.');

  let candidate = base;
  let counter = 1;

  while (await prisma.employee.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${counter++}`;
  }

  return candidate;
};

export const generateTempPassword = (): string => {
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
};