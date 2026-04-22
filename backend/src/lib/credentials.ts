import { prisma } from './prisma.js';
import crypto from 'crypto';

export const generateUsername = async (fullName: string): Promise<string> => {
  const base = fullName
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((part, i) => (i === 0 ? part : part[0]))   // firstname + initials
    .join('.');                                        // e.g. "ahmed.b"

  // Ensure uniqueness — append a counter if taken
  let candidate = base;
  let counter = 1;
  while (await prisma.employee.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${counter++}`;
  }
  return candidate;
};

export const generateTempPassword = (): string => {
  // 12-char: letters + digits, readable (no ambiguous chars)
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
};