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

  const [adminPassword, managerPassword, adminManagerPassword] =
    await Promise.all([
      bcrypt.hash('admin', 10),
      bcrypt.hash('manager', 10),
      bcrypt.hash('AdminManager', 10),
    ]);

  const admin = await prisma.employee.upsert({
    where: { username: 'admin' },
    update: {
      name: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      structure: { connect: { id: structure.id } },
      roles: {
        deleteMany: {},
        create: [{ role: { connect: { id: adminRole.id } } }],
      },
    },
    create: {
      name: 'admin',
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      structure: { connect: { id: structure.id } },
      roles: {
        create: [{ role: { connect: { id: adminRole.id } } }],
      },
    },
    include: { roles: { include: { role: true } } },
  });

  const manager = await prisma.employee.upsert({
    where: { username: 'manager' },
    update: {
      name: 'manager',
      email: 'manager@example.com',
      password: managerPassword,
      structure: { connect: { id: structure.id } },
      roles: {
        deleteMany: {},
        create: [{ role: { connect: { id: managerRole.id } } }],
      },
    },
    create: {
      name: 'manager',
      username: 'manager',
      email: 'manager@example.com',
      password: managerPassword,
      structure: { connect: { id: structure.id } },
      roles: {
        create: [{ role: { connect: { id: managerRole.id } } }],
      },
    },
    include: { roles: { include: { role: true } } },
  });

  const adminManager = await prisma.employee.upsert({
    where: { username: 'AdminManager' },
    update: {
      name: 'AdminManager',
      email: 'adminmanager@example.com',
      password: adminManagerPassword,
      structure: { connect: { id: structure.id } },
      roles: {
        deleteMany: {},
        create: [
          { role: { connect: { id: adminRole.id } } },
          { role: { connect: { id: managerRole.id } } },
        ],
      },
    },
    create: {
      name: 'AdminManager',
      username: 'AdminManager',
      email: 'adminmanager@example.com',
      password: adminManagerPassword,
      structure: { connect: { id: structure.id } },
      roles: {
        create: [
          { role: { connect: { id: adminRole.id } } },
          { role: { connect: { id: managerRole.id } } },
        ],
      },
    },
    include: { roles: { include: { role: true } } },
  });

  console.log('✅ Seed complete:', { admin, manager, adminManager });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());