import { prisma } from '../../lib/prisma.js';
import type { RoleType } from '../../../generated/prisma/client.js';
import { httpError } from '../../common/errors.js';

export async function getEmployeeRoleTypes(employeeId: number): Promise<RoleType[]> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      roles: {
        select: {
          role: { select: { type: true } },
        },
      },
    },
  });

  if (!employee) throw httpError(404, 'Employee not found');

  return employee.roles.map((r) => r.role.type);
}
