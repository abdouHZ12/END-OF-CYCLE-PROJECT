import { prisma } from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { generateUsername } from '../../lib/credentials.js';
import crypto from 'node:crypto';
import { sendAccountSetupEmail } from '../../lib/mailer.js';
import { tokenService } from '../auth/token.service.js';

export const getAllEmployees = async () => {
  return prisma.employee.findMany({
    include: {
      roles: { include: { role: true } },
      structure: true,
    },
    orderBy: { id: 'asc' },
  });
};

export const getEmployeeById = async (id: number) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      roles: { include: { role: true } },
      structure: true,
    },
  });
  if (!employee) throw new Error('EMPLOYEE_NOT_FOUND');
  return employee;
};

export const registerEmployee = async (data: {
  name: string;
  email: string;
  structureId: number;
  roleIds: number[];
}) => {
  const existing = await prisma.employee.findFirst({ where: { email: data.email } });
  if (existing) throw new Error('EMPLOYEE_ALREADY_EXISTS');

  const username = await generateUsername(data.name);
  const hashed = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

  const employee = await prisma.employee.create({
    data: {
      name: data.name,
      username,
      email: data.email,
      password: hashed,
      structureId: data.structureId,
      roles: { create: data.roleIds.map((roleId) => ({ roleId })) },
    },
    include: {
      roles: { include: { role: true } },
      structure: true,
    },
  });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await tokenService.hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await prisma.passwordReset.create({
    data: { token: hashedToken, expiresAt, employeeId: employee.id },
  });

  sendAccountSetupEmail(data.email, data.name, username, rawToken)
    .catch((err) => console.error('Failed to send setup email:', err));

  return employee;
};

export const updateEmployee = async (
  id: number,
  data: {
    name?: string;
    username?: string;
    email?: string;
    structureId?: number;
  }
) => {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw new Error('EMPLOYEE_NOT_FOUND');

  return prisma.employee.update({
    where: { id },
    data,
    include: {
      roles: { include: { role: true } },
      structure: true,
    },
  });
};

export const deleteEmployee = async (id: number) => {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw new Error('EMPLOYEE_NOT_FOUND');
  return prisma.employee.delete({ where: { id } });
};


export const assignRole = async (employeeId: number, roleId: number) => {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new Error('EMPLOYEE_NOT_FOUND');

  return prisma.employeeRole.upsert({
    where: { employeeId_roleId: { employeeId, roleId } },
    create: { employeeId, roleId },
    update: {},
  });
};

export const revokeRole = async (employeeId: number, roleId: number) => {
  const count = await prisma.employeeRole.count({ where: { employeeId } });
  if (count <= 1) throw new Error('LAST_ROLE');

  return prisma.employeeRole.delete({
    where: { employeeId_roleId: { employeeId, roleId } },
  });
};

export const getAllRoles = async () => {
  return prisma.role.findMany({ orderBy: { id: 'asc' } });
};


export const getAllStructures = async () => {
  return prisma.structure.findMany({
    include: {
      _count: { select: { employees: true } },
      parent: true,
    },
    orderBy: { id: 'asc' },
  });
};

export const createStructure = async (data: { name: string; parentId?: number }) => {
  return prisma.structure.create({
    data: { name: data.name, parentId: data.parentId ?? null },
    include: { _count: { select: { employees: true } }, parent: true },
  });
};

export const updateStructure = async (
  id: number,
  data: { name: string; parentId?: number | null }
) => {

  if (data.parentId === id) throw new Error("SELF_PARENT");

  return prisma.structure.update({
    where: { id },
    data: { name: data.name, parentId: data.parentId ?? null },
    include: { _count: { select: { employees: true } }, parent: true },
  });
};

export const deleteStructure = async (id: number) => {
  const hasEmployees = await prisma.employee.count({ where: { structureId: id } });
  if (hasEmployees > 0) throw new Error('STRUCTURE_HAS_EMPLOYEES');
  return prisma.structure.delete({ where: { id } });
};

export const createRole = async (data: {
  name: string;
  type: string;
  permissions: string;
}) => {
  const validTypes = ["ADMIN", "MANAGER", "WORKER", "AGENT"];
  if (!validTypes.includes(data.type)) throw new Error("INVALID_ROLE_TYPE");

  const existing = await prisma.role.findFirst({ where: { name: data.name } });
  if (existing) throw new Error("ROLE_ALREADY_EXISTS");

  return prisma.role.create({
    data: {
      name: data.name,
      type: data.type as import("../../../generated/prisma/client.js").RoleType,
      permissions: data.permissions ?? "",
    },
  });
};

export const updateRole = async (
  id: number,
  data: { name?: string; permissions?: string }
) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new Error("ROLE_NOT_FOUND");

  return prisma.role.update({ where: { id }, data });
};

export const deleteRole = async (id: number) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new Error("ROLE_NOT_FOUND");

  const inUse = await prisma.employeeRole.count({ where: { roleId: id } });
  if (inUse > 0) throw new Error("ROLE_IN_USE");

  return prisma.role.delete({ where: { id } });
};

export const getWorkers = async () => {
  return prisma.employee.findMany({
    where: {
      roles: {
        some: {
          role: {
            type: 'WORKER',
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
    },
    orderBy: { name: 'asc' },
  });
};