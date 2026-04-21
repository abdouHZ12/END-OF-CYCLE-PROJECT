import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const structure =
    (await prisma.structure.findFirst({ where: { name: 'Head Office' } })) ??
    (await prisma.structure.create({
      data: { name: 'Head Office' },
    }));

  const adminRole =
    (await prisma.role.findFirst({ where: { type: 'ADMIN' } })) ??
    (await prisma.role.create({
      data: {
        name: 'Administrator',
        type: 'ADMIN',
        permissions: '*',
      },
    }));

  const managerRole =
    (await prisma.role.findFirst({ where: { type: 'MANAGER' } })) ??
    (await prisma.role.create({
      data: {
        name: 'Manager',
        type: 'MANAGER',
        permissions: '*',
      },
    }));

  const employeeRole =
    (await prisma.role.findFirst({ where: { type: 'WORKER' } })) ??
    (await prisma.role.create({
      data: {
        name: 'Employee',
        type: 'WORKER',
        permissions: '*',
      },
    }));

  const [adminPassword, managerPassword, employeePassword] = await Promise.all([
    bcrypt.hash('admin', 10),
    bcrypt.hash('manager', 10),
    bcrypt.hash('employee', 10),
  ]);

  const admin = await prisma.employee.upsert({
    where: { username: 'admin' },
    update: {
      name: 'Admin',
      email: 'admin@example.com',
      password: adminPassword,
      roleId: adminRole.id,
      structureId: structure.id,
    },
    create: {
      name: 'Admin',
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      roleId: adminRole.id,
      structureId: structure.id,
    },
  });

  const manager = await prisma.employee.upsert({
    where: { username: 'manager' },
    update: {
      name: 'Manager',
      email: 'manager@example.com',
      password: managerPassword,
      roleId: managerRole.id,
      structureId: structure.id,
    },
    create: {
      name: 'Manager',
      username: 'manager',
      email: 'manager@example.com',
      password: managerPassword,
      roleId: managerRole.id,
      structureId: structure.id,
    },
  });

  const employee = await prisma.employee.upsert({
    where: { username: 'employee' },
    update: {
      name: 'Employee',
      email: 'employee@example.com',
      password: employeePassword,
      roleId: employeeRole.id,
      structureId: structure.id,
    },
    create: {
      name: 'Employee',
      username: 'employee',
      email: 'employee@example.com',
      password: employeePassword,
      roleId: employeeRole.id,
      structureId: structure.id,
    },
  });

  console.log('✅ Seed complete:', { admin, manager, employee });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());