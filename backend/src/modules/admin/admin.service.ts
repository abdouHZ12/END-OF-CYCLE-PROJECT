import { prisma } from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';

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
  username: string;
  email: string;
  password: string;
  structureId: number;
  roleIds: number[];
}) => {
  const existing = await prisma.employee.findFirst({
    where: { OR: [{ username: data.username }, { email: data.email }] },
  });
  if (existing) throw new Error('EMPLOYEE_ALREADY_EXISTS');

  const hashed = await bcrypt.hash(data.password, 10);

  return prisma.employee.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashed,
      structureId: data.structureId,
      roles: {
        create: data.roleIds.map((roleId) => ({ roleId })),
      },
    },
    include: {
      roles: { include: { role: true } },
      structure: true,
    },
  });
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

export const updateStructure = async (id: number, name: string) => {
  return prisma.structure.update({
    where: { id },
    data: { name },
    include: { _count: { select: { employees: true } }, parent: true },
  });
};

export const deleteStructure = async (id: number) => {
  const hasEmployees = await prisma.employee.count({ where: { structureId: id } });
  if (hasEmployees > 0) throw new Error('STRUCTURE_HAS_EMPLOYEES');
  return prisma.structure.delete({ where: { id } });
};