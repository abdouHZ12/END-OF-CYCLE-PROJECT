import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const hoursAfter = (base: Date, h: number) => new Date(base.getTime() + h * 3_600_000);

async function hashAll(passwords: string[]): Promise<[string, string, string, string]> {
  return Promise.all(passwords.map((p) => bcrypt.hash(p, 10))) as Promise<[string, string, string, string]>;
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  // ── 1. ROLES ────────────────────────────────
  const roleAdmin = await prisma.role.upsert({
    where: { type: 'ADMIN' },
    update: {},
    create: { name: 'Administrator', type: 'ADMIN', permissions: '*' },
  });
  const roleManager = await prisma.role.upsert({
    where: { type: 'MANAGER' },
    update: {},
    create: { name: 'Manager', type: 'MANAGER', permissions: '*' },
  });
  const roleWorker = await prisma.role.upsert({
    where: { type: 'WORKER' },
    update: {},
    create: { name: 'Worker', type: 'WORKER', permissions: '*' },
  });
  const roleAgent = await prisma.role.upsert({
    where: { type: 'AGENT' },
    update: {},
    create: { name: 'Agent', type: 'AGENT', permissions: '*' },
  });

  // ── 2. HASH PASSWORDS ────────────────────────
  const [pwAdmin, pwManager, pwWorker, pwAgent] = await hashAll(['admin123', 'manager123', 'worker123', 'agent123']);

  // ─────────────────────────────────────────────
  // HELPER: create or upsert an employee
  // ─────────────────────────────────────────────
  async function createEmployee(opts: {
    name: string;
    username: string;
    email: string;
    password: string;
    structureId: number;
    roleIds: number[];
  }) {
    return prisma.employee.upsert({
      where: { username: opts.username },
      update: {
        name: opts.name,
        email: opts.email,
        password: opts.password,
        structure: { connect: { id: opts.structureId } },
        roles: {
          deleteMany: {},
          create: opts.roleIds.map((id) => ({ role: { connect: { id } } })),
        },
      },
      create: {
        name: opts.name,
        username: opts.username,
        email: opts.email,
        password: opts.password,
        structure: { connect: { id: opts.structureId } },
        roles: {
          create: opts.roleIds.map((id) => ({ role: { connect: { id } } })),
        },
      },
    });
  }

  // ─────────────────────────────────────────────
  // 3. STRUCTURES (create without managerId first)
  // ─────────────────────────────────────────────
  const mkStruct = (name: string, parentId?: number) =>
    prisma.structure.upsert({
      where: { name },
      update: {},
      create: { name, ...(parentId ? { parentId } : {}) },
    });

  // Root
  const sCEO = await mkStruct('Head Office (CEO)');

  // Branches
  const sFuel = await mkStruct('Fuel Branch', sCEO.id);
  const sMarketing = await mkStruct('Marketing Branch', sCEO.id);
  const sLPG = await mkStruct('LPG Branch', sCEO.id);

  // Fuel departments
  const sFuelFinance = await mkStruct('Executive Directorate of Finance', sFuel.id);
  const sFuelHR = await mkStruct('Executive Directorate of Human Resources', sFuel.id);
  const sFuelGA = await mkStruct('General Administration Directorate', sFuel.id);

  // Marketing departments
  const sMarkets = await mkStruct('Markets Directorate', sMarketing.id);
  const sQuality = await mkStruct('Central Directorate of Quality Management', sMarketing.id);
  const sComms = await mkStruct('Central Directorate of Communication & PR', sMarketing.id);

  // LPG departments
  const sMaintenance = await mkStruct('Central Directorate of Maintenance', sLPG.id);
  const sSecurity = await mkStruct('Central Directorate of Internal Security', sLPG.id);
  const sLegal = await mkStruct('Central Directorate of Legal Affairs', sLPG.id);

  // ─────────────────────────────────────────────
  // 4. EMPLOYEES
  // ─────────────────────────────────────────────

  // ── CEO-level admin ──────────────────────────
  const eCEO = await createEmployee({
    name: 'Youcef Benali',
    username: 'y.benali',
    email: 'y.benali@naftal.dz',
    password: pwManager,
    structureId: sCEO.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });

  // ── FUEL BRANCH ─────────────────────────────
  const eFuelMgr = await createEmployee({
    name: 'Rachid Boudiaf',
    username: 'r.boudiaf',
    email: 'r.boudiaf@naftal.dz',
    password: pwManager,
    structureId: sFuel.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });

  // Finance dept
  const eFinanceMgr = await createEmployee({
    name: 'Amina Haddad',
    username: 'a.haddad',
    email: 'a.haddad@naftal.dz',
    password: pwManager,
    structureId: sFuelFinance.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eFinanceWorker1 = await createEmployee({
    name: 'Sofiane Belhadj', // EXIT ABUSER
    username: 's.belhadj',
    email: 's.belhadj@naftal.dz',
    password: pwWorker,
    structureId: sFuelFinance.id,
    roleIds: [roleWorker.id],
  });
  const eFinanceWorker2 = await createEmployee({
    name: 'Nadia Cherif', // CLEAN
    username: 'n.cherif',
    email: 'n.cherif@naftal.dz',
    password: pwWorker,
    structureId: sFuelFinance.id,
    roleIds: [roleWorker.id],
  });
  const eFinanceWorker3 = await createEmployee({
    name: 'Karim Meziane', // GHOST (NOT_RETURNED)
    username: 'k.meziane',
    email: 'k.meziane@naftal.dz',
    password: pwWorker,
    structureId: sFuelFinance.id,
    roleIds: [roleWorker.id],
  });
  const eFinanceAgent = await createEmployee({
    name: 'Farid Ouali',
    username: 'f.ouali',
    email: 'f.ouali@naftal.dz',
    password: pwAgent,
    structureId: sFuelFinance.id,
    roleIds: [roleAgent.id],
  });

  // HR dept
  const eHRMgr = await createEmployee({
    name: 'Meriem Saadi',
    username: 'm.saadi',
    email: 'm.saadi@naftal.dz',
    password: pwManager,
    structureId: sFuelHR.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eHRWorker1 = await createEmployee({
    name: 'Tarek Boudissa', // CHRONIC ABSENTEE
    username: 't.boudissa',
    email: 't.boudissa@naftal.dz',
    password: pwWorker,
    structureId: sFuelHR.id,
    roleIds: [roleWorker.id],
  });
  const eHRWorker2 = await createEmployee({
    name: 'Lynda Aissaoui', // CLEAN
    username: 'l.aissaoui',
    email: 'l.aissaoui@naftal.dz',
    password: pwWorker,
    structureId: sFuelHR.id,
    roleIds: [roleWorker.id],
  });
  const eHRWorker3 = await createEmployee({
    name: 'Omar Ghezali',
    username: 'o.ghezali',
    email: 'o.ghezali@naftal.dz',
    password: pwWorker,
    structureId: sFuelHR.id,
    roleIds: [roleWorker.id],
  });
  const eHRAgent = await createEmployee({
    name: 'Selma Kaci',
    username: 's.kaci',
    email: 's.kaci@naftal.dz',
    password: pwAgent,
    structureId: sFuelHR.id,
    roleIds: [roleAgent.id],
  });

  // GA dept
  const eGAMgr = await createEmployee({
    name: 'Djamel Lounès',
    username: 'd.lounes',
    email: 'd.lounes@naftal.dz',
    password: pwManager,
    structureId: sFuelGA.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eGAWorker1 = await createEmployee({
    name: 'Yasmine Hadj', // PENDING BLOCKER
    username: 'y.hadj',
    email: 'y.hadj@naftal.dz',
    password: pwWorker,
    structureId: sFuelGA.id,
    roleIds: [roleWorker.id],
  });
  const eGAWorker2 = await createEmployee({
    name: 'Nassim Rekik',
    username: 'n.rekik',
    email: 'n.rekik@naftal.dz',
    password: pwWorker,
    structureId: sFuelGA.id,
    roleIds: [roleWorker.id],
  });
  const eGAWorker3 = await createEmployee({
    name: 'Hamid Benaissa',
    username: 'h.benaissa',
    email: 'h.benaissa@naftal.dz',
    password: pwWorker,
    structureId: sFuelGA.id,
    roleIds: [roleWorker.id],
  });
  const eGAAgent = await createEmployee({
    name: 'Riad Ferhat',
    username: 'r.ferhat',
    email: 'r.ferhat@naftal.dz',
    password: pwAgent,
    structureId: sFuelGA.id,
    roleIds: [roleAgent.id],
  });

  // ── MARKETING BRANCH ────────────────────────
  const eMarketingMgr = await createEmployee({
    name: 'Sihem Boukezzoula',
    username: 's.boukezzoula',
    email: 's.boukezzoula@naftal.dz',
    password: pwManager,
    structureId: sMarketing.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });

  // Markets dept
  const eMarketsMgr = await createEmployee({
    name: 'Khaled Mezrag',
    username: 'k.mezrag',
    email: 'k.mezrag@naftal.dz',
    password: pwManager,
    structureId: sMarkets.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eMarketsWorker1 = await createEmployee({
    name: 'Wissem Taleb', // MISSION TRAVELER
    username: 'w.taleb',
    email: 'w.taleb@naftal.dz',
    password: pwWorker,
    structureId: sMarkets.id,
    roleIds: [roleWorker.id],
  });
  const eMarketsWorker2 = await createEmployee({
    name: 'Imane Zitouni', // CLEAN
    username: 'i.zitouni',
    email: 'i.zitouni@naftal.dz',
    password: pwWorker,
    structureId: sMarkets.id,
    roleIds: [roleWorker.id],
  });
  const eMarketsWorker3 = await createEmployee({
    name: 'Billal Ould Braham',
    username: 'b.ouldbraham',
    email: 'b.ouldbraham@naftal.dz',
    password: pwWorker,
    structureId: sMarkets.id,
    roleIds: [roleWorker.id],
  });
  const eMarketsAgent = await createEmployee({
    name: 'Sonia Tizi',
    username: 's.tizi',
    email: 's.tizi@naftal.dz',
    password: pwAgent,
    structureId: sMarkets.id,
    roleIds: [roleAgent.id],
  });

  // Quality dept
  const eQualityMgr = await createEmployee({
    name: 'Lyes Cherchali',
    username: 'l.cherchali',
    email: 'l.cherchali@naftal.dz',
    password: pwManager,
    structureId: sQuality.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eQualityWorker1 = await createEmployee({
    name: 'Feriel Bouras',
    username: 'f.bouras',
    email: 'f.bouras@naftal.dz',
    password: pwWorker,
    structureId: sQuality.id,
    roleIds: [roleWorker.id],
  });
  const eQualityWorker2 = await createEmployee({
    name: 'Aymen Daoud',
    username: 'a.daoud',
    email: 'a.daoud@naftal.dz',
    password: pwWorker,
    structureId: sQuality.id,
    roleIds: [roleWorker.id],
  });
  const eQualityWorker3 = await createEmployee({
    name: 'Rania Benziane',
    username: 'r.benziane',
    email: 'r.benziane@naftal.dz',
    password: pwWorker,
    structureId: sQuality.id,
    roleIds: [roleWorker.id],
  });
  const eQualityAgent = await createEmployee({
    name: 'Mehdi Bouzid',
    username: 'm.bouzid',
    email: 'm.bouzid@naftal.dz',
    password: pwAgent,
    structureId: sQuality.id,
    roleIds: [roleAgent.id],
  });

  // Comms dept
  const eCommsMgr = await createEmployee({
    name: 'Houria Benhadj',
    username: 'h.benhadj',
    email: 'h.benhadj@naftal.dz',
    password: pwManager,
    structureId: sComms.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eCommsWorker1 = await createEmployee({
    name: 'Zine Guerroudj',
    username: 'z.guerroudj',
    email: 'z.guerroudj@naftal.dz',
    password: pwWorker,
    structureId: sComms.id,
    roleIds: [roleWorker.id],
  });
  const eCommsWorker2 = await createEmployee({
    name: 'Djihane Moussaoui',
    username: 'd.moussaoui',
    email: 'd.moussaoui@naftal.dz',
    password: pwWorker,
    structureId: sComms.id,
    roleIds: [roleWorker.id],
  });
  const eCommsWorker3 = await createEmployee({
    name: 'Abdelhak Slimani',
    username: 'a.slimani',
    email: 'a.slimani@naftal.dz',
    password: pwWorker,
    structureId: sComms.id,
    roleIds: [roleWorker.id],
  });
  const eCommsAgent = await createEmployee({
    name: 'Sabrina Guerfi',
    username: 's.guerfi',
    email: 's.guerfi@naftal.dz',
    password: pwAgent,
    structureId: sComms.id,
    roleIds: [roleAgent.id],
  });

  // ── LPG BRANCH ──────────────────────────────
  const eLGPMgr = await createEmployee({
    name: 'Mourad Khelifi',
    username: 'm.khelifi',
    email: 'm.khelifi@naftal.dz',
    password: pwManager,
    structureId: sLPG.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });

  // Maintenance dept
  const eMainMgr = await createEmployee({
    name: 'Hocine Bellouti',
    username: 'h.bellouti',
    email: 'h.bellouti@naftal.dz',
    password: pwManager,
    structureId: sMaintenance.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eMainWorker1 = await createEmployee({
    name: 'Fares Djemaï',
    username: 'f.djemai',
    email: 'f.djemai@naftal.dz',
    password: pwWorker,
    structureId: sMaintenance.id,
    roleIds: [roleWorker.id],
  });
  const eMainWorker2 = await createEmployee({
    name: 'Amel Boudra',
    username: 'a.boudra',
    email: 'a.boudra@naftal.dz',
    password: pwWorker,
    structureId: sMaintenance.id,
    roleIds: [roleWorker.id],
  });
  const eMainWorker3 = await createEmployee({
    name: 'Salim Arfa',
    username: 's.arfa',
    email: 's.arfa@naftal.dz',
    password: pwWorker,
    structureId: sMaintenance.id,
    roleIds: [roleWorker.id],
  });
  const eMainAgent = await createEmployee({
    name: 'Nawal Toumi',
    username: 'n.toumi',
    email: 'n.toumi@naftal.dz',
    password: pwAgent,
    structureId: sMaintenance.id,
    roleIds: [roleAgent.id],
  });

  // Security dept
  const eSecMgr = await createEmployee({
    name: 'Samir Hadjadj',
    username: 's.hadjadj',
    email: 's.hadjadj@naftal.dz',
    password: pwManager,
    structureId: sSecurity.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eSecWorker1 = await createEmployee({
    name: 'Idir Baali',
    username: 'i.baali',
    email: 'i.baali@naftal.dz',
    password: pwWorker,
    structureId: sSecurity.id,
    roleIds: [roleWorker.id],
  });
  const eSecWorker2 = await createEmployee({
    name: 'Chafia Mekki',
    username: 'c.mekki',
    email: 'c.mekki@naftal.dz',
    password: pwWorker,
    structureId: sSecurity.id,
    roleIds: [roleWorker.id],
  });
  const eSecWorker3 = await createEmployee({
    name: 'Yassine Hamidi',
    username: 'y.hamidi',
    email: 'y.hamidi@naftal.dz',
    password: pwWorker,
    structureId: sSecurity.id,
    roleIds: [roleWorker.id],
  });
  const eSecAgent = await createEmployee({
    name: 'Keltoum Maamar',
    username: 'k.maamar',
    email: 'k.maamar@naftal.dz',
    password: pwAgent,
    structureId: sSecurity.id,
    roleIds: [roleAgent.id],
  });

  // Legal dept
  const eLegalMgr = await createEmployee({
    name: 'Noureddine Belaïd',
    username: 'n.belaid',
    email: 'n.belaid@naftal.dz',
    password: pwManager,
    structureId: sLegal.id,
    roleIds: [roleAdmin.id, roleManager.id],
  });
  const eLegalWorker1 = await createEmployee({
    name: 'Assia Chebli',
    username: 'a.chebli',
    email: 'a.chebli@naftal.dz',
    password: pwWorker,
    structureId: sLegal.id,
    roleIds: [roleWorker.id],
  });
  const eLegalWorker2 = await createEmployee({
    name: 'Malek Benhamed',
    username: 'm.benhamed',
    email: 'm.benhamed@naftal.dz',
    password: pwWorker,
    structureId: sLegal.id,
    roleIds: [roleWorker.id],
  });
  const eLegalWorker3 = await createEmployee({
    name: 'Fouzia Zenadi',
    username: 'f.zenadi',
    email: 'f.zenadi@naftal.dz',
    password: pwWorker,
    structureId: sLegal.id,
    roleIds: [roleWorker.id],
  });
  const eLegalAgent = await createEmployee({
    name: 'Adel Messaoud',
    username: 'a.messaoud',
    email: 'a.messaoud@naftal.dz',
    password: pwAgent,
    structureId: sLegal.id,
    roleIds: [roleAgent.id],
  });

  const managerAssignments = [
    { structureId: sCEO.id, managerId: eCEO.id },
    { structureId: sFuel.id, managerId: eFuelMgr.id },
    { structureId: sMarketing.id, managerId: eMarketingMgr.id },
    { structureId: sLPG.id, managerId: eLGPMgr.id },
    { structureId: sFuelFinance.id, managerId: eFinanceMgr.id },
    { structureId: sFuelHR.id, managerId: eHRMgr.id },
    { structureId: sFuelGA.id, managerId: eGAMgr.id },
    { structureId: sMarkets.id, managerId: eMarketsMgr.id },
    { structureId: sQuality.id, managerId: eQualityMgr.id },
    { structureId: sComms.id, managerId: eCommsMgr.id },
    { structureId: sMaintenance.id, managerId: eMainMgr.id },
    { structureId: sSecurity.id, managerId: eSecMgr.id },
    { structureId: sLegal.id, managerId: eLegalMgr.id },
  ];
  await Promise.all(
    managerAssignments.map(({ structureId, managerId }) =>
      prisma.structure.update({ where: { id: structureId }, data: { managerId } }),
    ),
  );

  async function exitSlip(opts: {
    employeeId: number;
    decidedById?: number;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    createdDaysAgo: number;
    exitHour?: number;
    returnHour?: number;
    gate: string;
    leaveStatus: 'OUT' | 'RETURNED' | 'NOT_RETURNED';
  }) {
    const created = daysAgo(opts.createdDaysAgo);
    const exitTime = hoursAfter(created, opts.exitHour ?? 9);
    const returnTime = hoursAfter(created, opts.returnHour ?? 17);
    const doc = await prisma.document.create({
      data: {
        type: 'EXIT_SLIP',
        status: opts.status,
        createdAt: created,
        ...(opts.status === 'APPROVED' ? { authIssuedAt: hoursAfter(created, 0.5) } : {}),
        issuedById: opts.employeeId,
        ...(opts.decidedById ? { decisionMadeById: opts.decidedById } : {}),
      },
    });
    await prisma.exitSlip.create({
      data: { documentId: doc.id, exitTime, returnTime, gate: opts.gate },
    });
    await prisma.leaveSession.create({
      data: {
        employeeId: opts.employeeId,
        status: opts.leaveStatus,
        leaveTime: exitTime,
        ...(opts.leaveStatus === 'RETURNED' ? { returnTime } : {}),
        documentId: doc.id,
      },
    });
    return doc;
  }

  async function absenceAuth(opts: {
    employeeId: number;
    decidedById?: number;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    createdDaysAgo: number;
    startDaysAgo: number;
    durationDays?: number;
    reason: string;
    leaveStatus: 'OUT' | 'RETURNED' | 'NOT_RETURNED';
  }) {
    const created = daysAgo(opts.createdDaysAgo);
    const startDate = daysAgo(opts.startDaysAgo);
    const endDate = daysAgo(opts.startDaysAgo - (opts.durationDays ?? 1));
    const doc = await prisma.document.create({
      data: {
        type: 'ABSENCE_AUTH',
        status: opts.status,
        createdAt: created,
        ...(opts.status === 'APPROVED' ? { authIssuedAt: hoursAfter(created, 2) } : {}),
        issuedById: opts.employeeId,
        ...(opts.decidedById ? { decisionMadeById: opts.decidedById } : {}),
      },
    });
    await prisma.absenceAuth.create({
      data: { documentId: doc.id, startDate, endDate, reason: opts.reason },
    });
    await prisma.leaveSession.create({
      data: {
        employeeId: opts.employeeId,
        status: opts.leaveStatus,
        leaveTime: startDate,
        ...(opts.leaveStatus === 'RETURNED' ? { returnTime: endDate } : {}),
        documentId: doc.id,
      },
    });
    return doc;
  }

  async function missionOrder(opts: {
    employeeId: number;
    decidedById?: number;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    createdDaysAgo: number;
    destination: string;
    duration: number;
    purpose: string;
    travelMethod: 'PERSONAL' | 'COMPANY' | 'AIRPLANE';
  }) {
    const created = daysAgo(opts.createdDaysAgo);
    const doc = await prisma.document.create({
      data: {
        type: 'MISSION_ORDER',
        status: opts.status,
        createdAt: created,
        ...(opts.status === 'APPROVED' ? { authIssuedAt: hoursAfter(created, 3) } : {}),
        issuedById: opts.employeeId,
        ...(opts.decidedById ? { decisionMadeById: opts.decidedById } : {}),
      },
    });
    await prisma.missionOrder.create({
      data: {
        documentId: doc.id,
        destination: opts.destination,
        duration: opts.duration,
        purpose: opts.purpose,
        travelMethod: opts.travelMethod,
      },
    });
    return doc;
  }

  const exitAbuserId = eFinanceWorker1.id;
  const exitAbuserMgr = eFinanceMgr.id;

  await exitSlip({ employeeId: exitAbuserId, decidedById: exitAbuserMgr, status: 'APPROVED', createdDaysAgo: 28, exitHour: 10, returnHour: 13, gate: 'Gate 1', leaveStatus: 'RETURNED' });
  await exitSlip({ employeeId: exitAbuserId, decidedById: exitAbuserMgr, status: 'APPROVED', createdDaysAgo: 25, exitHour: 9,  returnHour: 12, gate: 'Gate 2', leaveStatus: 'RETURNED' });
  await exitSlip({ employeeId: exitAbuserId, decidedById: exitAbuserMgr, status: 'APPROVED', createdDaysAgo: 22, exitHour: 14, returnHour: 16, gate: 'Gate 1', leaveStatus: 'RETURNED' });
  await exitSlip({ employeeId: exitAbuserId, decidedById: exitAbuserMgr, status: 'APPROVED', createdDaysAgo: 18, exitHour: 11, returnHour: 14, gate: 'Gate 3', leaveStatus: 'RETURNED' });
  await exitSlip({ employeeId: exitAbuserId, decidedById: exitAbuserMgr, status: 'APPROVED', createdDaysAgo: 14, exitHour: 8,  returnHour: 11, gate: 'Gate 2', leaveStatus: 'RETURNED' });
  await exitSlip({ employeeId: exitAbuserId, decidedById: exitAbuserMgr, status: 'APPROVED', createdDaysAgo: 7,  exitHour: 10, returnHour: 13, gate: 'Gate 1', leaveStatus: 'RETURNED' });
  await exitSlip({ employeeId: exitAbuserId, decidedById: exitAbuserMgr, status: 'APPROVED', createdDaysAgo: 2,  exitHour: 9,  returnHour: 12, gate: 'Gate 3', leaveStatus: 'RETURNED' });

  const ghostId = eFinanceWorker3.id;
  const ghostMgr = eFinanceMgr.id;

  await exitSlip({ employeeId: ghostId, decidedById: ghostMgr, status: 'APPROVED', createdDaysAgo: 30, gate: 'Gate 2', leaveStatus: 'NOT_RETURNED' });
  await exitSlip({ employeeId: ghostId, decidedById: ghostMgr, status: 'APPROVED', createdDaysAgo: 20, gate: 'Gate 1', leaveStatus: 'NOT_RETURNED' });
  await exitSlip({ employeeId: ghostId, decidedById: ghostMgr, status: 'APPROVED', createdDaysAgo: 10, gate: 'Gate 2', leaveStatus: 'NOT_RETURNED' });
  await exitSlip({ employeeId: ghostId, decidedById: ghostMgr, status: 'APPROVED', createdDaysAgo: 4,  gate: 'Gate 1', leaveStatus: 'NOT_RETURNED' });

  // s.belhadj — 7 exits in 10 days history -> recentApproved > 5 -> +30 -> REVIEW
  await exitSlip({ employeeId: exitAbuserId, status: 'PENDING', createdDaysAgo: 1, exitHour: 9, returnHour: 14, gate: 'Gate 1', leaveStatus: 'OUT' });

  // k.meziane — 4x NOT_RETURNED history -> notReturnedNb > 3 -> +40 -> REJECT
  await exitSlip({ employeeId: ghostId, status: 'PENDING', createdDaysAgo: 1, exitHour: 8, returnHour: 12, gate: 'Gate 2', leaveStatus: 'OUT' });

  // ─────────────────────────────────────────────
  // DSS SCENARIO 3 — CHRONIC ABSENTEE
  // ─────────────────────────────────────────────
  const absentId = eHRWorker1.id;
  const absentMgr = eHRMgr.id;

  await absenceAuth({ employeeId: absentId, decidedById: absentMgr, status: 'APPROVED', createdDaysAgo: 60, startDaysAgo: 58, durationDays: 2, reason: 'Family event',        leaveStatus: 'RETURNED' });
  await absenceAuth({ employeeId: absentId, decidedById: absentMgr, status: 'APPROVED', createdDaysAgo: 45, startDaysAgo: 43, durationDays: 1, reason: 'Medical appointment', leaveStatus: 'RETURNED' });
  await absenceAuth({ employeeId: absentId, decidedById: absentMgr, status: 'APPROVED', createdDaysAgo: 30, startDaysAgo: 28, durationDays: 3, reason: 'Illness',             leaveStatus: 'RETURNED' });
  await absenceAuth({ employeeId: absentId, decidedById: absentMgr, status: 'APPROVED', createdDaysAgo: 15, startDaysAgo: 13, durationDays: 1, reason: 'Personal matter',     leaveStatus: 'RETURNED' });
  await absenceAuth({ employeeId: absentId, status: 'PENDING', createdDaysAgo: 5, startDaysAgo: 3, durationDays: 2, reason: 'Tiredness', leaveStatus: 'OUT' });

  // ─────────────────────────────────────────────
  // DSS SCENARIO 4 — MISSION TRAVELER
  // ─────────────────────────────────────────────
  const missionId = eMarketsWorker1.id;
  const missionMgr = eMarketsMgr.id;

  await missionOrder({ employeeId: missionId, decidedById: missionMgr, status: 'APPROVED', createdDaysAgo: 90, destination: 'Paris, France',    duration: 14, purpose: 'International trade fair',        travelMethod: 'AIRPLANE' });
  await missionOrder({ employeeId: missionId, decidedById: missionMgr, status: 'APPROVED', createdDaysAgo: 60, destination: 'Dubai, UAE',        duration: 10, purpose: 'Fuel distribution summit',        travelMethod: 'AIRPLANE' });
  await missionOrder({ employeeId: missionId, decidedById: missionMgr, status: 'APPROVED', createdDaysAgo: 30, destination: 'Tunis, Tunisia',    duration: 7,  purpose: 'Regional partner negotiations',   travelMethod: 'AIRPLANE' });
  await missionOrder({ employeeId: missionId, decidedById: missionMgr, status: 'APPROVED', createdDaysAgo: 10, destination: 'Oran, Algeria',     duration: 5,  purpose: 'Regional market assessment',      travelMethod: 'COMPANY' });
  await missionOrder({ employeeId: missionId, status: 'PENDING', createdDaysAgo: 2, destination: 'Istanbul, Turkey', duration: 12, purpose: 'Energy sector conference', travelMethod: 'AIRPLANE' });

  // ─────────────────────────────────────────────
  // DSS SCENARIO 5 — PENDING BLOCKER
  // ─────────────────────────────────────────────
  const blockerId = eGAWorker1.id;

  await exitSlip({ employeeId: blockerId, status: 'PENDING', createdDaysAgo: 20, gate: 'Gate 1', leaveStatus: 'OUT' });
  await exitSlip({ employeeId: blockerId, status: 'PENDING', createdDaysAgo: 15, gate: 'Gate 2', leaveStatus: 'OUT' });
  await absenceAuth({ employeeId: blockerId, status: 'PENDING', createdDaysAgo: 12, startDaysAgo: 10, reason: 'Medical appointment', leaveStatus: 'OUT' });
  await absenceAuth({ employeeId: blockerId, status: 'PENDING', createdDaysAgo: 7,  startDaysAgo: 5,  reason: 'Family emergency',    leaveStatus: 'OUT' });

  // ─────────────────────────────────────────────
  // CLEAN BASELINES
  // ─────────────────────────────────────────────
  await exitSlip({ employeeId: eFinanceWorker2.id, decidedById: eFinanceMgr.id, status: 'APPROVED', createdDaysAgo: 20, gate: 'Gate 1', leaveStatus: 'RETURNED' });
  await absenceAuth({ employeeId: eFinanceWorker2.id, decidedById: eFinanceMgr.id, status: 'APPROVED', createdDaysAgo: 40, startDaysAgo: 38, reason: 'Medical appointment', leaveStatus: 'RETURNED' });
  await exitSlip({ employeeId: eHRWorker2.id, decidedById: eHRMgr.id, status: 'APPROVED', createdDaysAgo: 15, gate: 'Gate 2', leaveStatus: 'RETURNED' });
  await missionOrder({ employeeId: eMarketsWorker2.id, decidedById: eMarketsMgr.id, status: 'APPROVED', createdDaysAgo: 25, destination: 'Algiers, Algeria', duration: 2, purpose: 'Client meeting', travelMethod: 'PERSONAL' });

  console.log(`
+==================================================================+
| NAFTAL SEED COMPLETE                                             |
+==================================================================+
| STRUCTURES (13 total)                                            |
|   1 Root: Head Office (CEO)                                      |
|   3 Branches: Fuel / Marketing / LPG                             |
|   9 Departments (3 per branch)                                   |
+==================================================================+
| DSS FLAGGING SCENARIOS                                           |
|   Exit Abuser     -> s.belhadj  (7 exits / 30 days)             |
|   Ghost Worker    -> k.meziane  (4x NOT_RETURNED)               |
|   Chronic Absentee-> t.boudissa (5 absences)                    |
|   Mission Traveler-> w.taleb    (5 missions, 3x plane)          |
|   Pending Blocker -> y.hadj     (4 docs stuck PENDING)          |
|   Clean Baselines -> n.cherif / l.aissaoui / i.zitouni          |
+==================================================================+
| CREDENTIALS                                                      |
|   Admin+Manager password : manager123                            |
|   Worker password        : worker123                             |
|   Agent password         : agent123                              |
+==================================================================+
| KEY ACCOUNTS                                                     |
|   y.benali       CEO / Global Admin                              |
|   r.boudiaf      Fuel Branch Manager                             |
|   s.boukezzoula  Marketing Branch Manager                        |
|   m.khelifi      LPG Branch Manager                              |
|   a.haddad       Finance Dept Manager                            |
|   s.belhadj      Exit Abuser                                     |
|   k.meziane      Ghost Worker                                    |
|   t.boudissa     Chronic Absentee                                |
|   w.taleb        Mission Traveler                                |
|   y.hadj         Pending Blocker                                 |
+==================================================================+
  `);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());