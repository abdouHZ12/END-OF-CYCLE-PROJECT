import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const structure =
    (await prisma.structure.findFirst({ where: { name: 'Head Office' } })) ??
    (await prisma.structure.create({
      data: { name: 'Head Office' },
    }));

  const role =
    (await prisma.role.findFirst({ where: { type: 'ADMIN' } })) ??
    (await prisma.role.create({
      data: {
        name: 'Administrator',
        type: 'ADMIN',
        permissions: '*',
      },
    }));

  const hashedPassword = await bcrypt.hash('password123', 10);
  const employee = await prisma.employee.upsert({
    where: { username: 'john.doe' },
    update: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      roleId: role.id,
      structureId: structure.id,
    },
    create: {
      name: 'John Doe',
      username: 'john.doe',
      email: 'john@example.com',
      password: hashedPassword,
      roleId: role.id,
      structureId: structure.id,
    },
  });

	const kasbadji = await prisma.employee.upsert({
		where: { username: 'kasbadji' },
		update: {
			name: 'kasbadji',
			email: 'kasbadjihalim01@gmail.com',
			password: hashedPassword,
			roleId: role.id,
			structureId: structure.id,
		},
		create: {
			name: 'kasbadji',
			username: 'kasbadji',
			email: 'kasbadjihalim01@gmail.com',
			password: hashedPassword,
			roleId: role.id,
			structureId: structure.id,
		},
	});

	console.log('✅ Seed complete:', { employee, kasbadji });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());