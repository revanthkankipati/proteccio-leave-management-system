import { PrismaClient, Role, LeaveTypeEnum } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('Password123', 12);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@proteccio.com' },
    update: {},
    create: {
      email: 'manager@proteccio.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Manager',
      role: Role.MANAGER,
      department: 'Engineering',
      position: 'Engineering Manager',
      phone: '+1-555-0100',
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@proteccio.com' },
    update: {},
    create: {
      email: 'employee@proteccio.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Employee',
      role: Role.EMPLOYEE,
      department: 'Engineering',
      position: 'Software Engineer',
      phone: '+1-555-0101',
    },
  });

  const leaveTypes = [
    { name: 'Annual Leave', code: LeaveTypeEnum.ANNUAL, daysPerYear: 20, description: 'Paid annual vacation leave' },
    { name: 'Sick Leave', code: LeaveTypeEnum.SICK, daysPerYear: 15, description: 'Paid sick leave' },
    { name: 'Personal Leave', code: LeaveTypeEnum.PERSONAL, daysPerYear: 5, description: 'Paid personal leave' },
    { name: 'Maternity Leave', code: LeaveTypeEnum.MATERNITY, daysPerYear: 90, description: 'Paid maternity leave' },
    { name: 'Paternity Leave', code: LeaveTypeEnum.PATERNITY, daysPerYear: 14, description: 'Paid paternity leave' },
    { name: 'Unpaid Leave', code: LeaveTypeEnum.UNPAID, daysPerYear: 30, description: 'Unpaid leave' },
    { name: 'Other', code: LeaveTypeEnum.OTHER, daysPerYear: 10, description: 'Other leave types' },
  ];

  const createdLeaveTypes = [];
  for (const lt of leaveTypes) {
    const created = await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: {},
      create: lt,
    });
    createdLeaveTypes.push(created);
  }

  const currentYear = new Date().getFullYear();
  for (const lt of createdLeaveTypes) {
    await prisma.leaveBalance.upsert({
      where: {
        userId_leaveTypeId_year: {
          userId: employee.id,
          leaveTypeId: lt.id,
          year: currentYear,
        },
      },
      update: {},
      create: {
        userId: employee.id,
        leaveTypeId: lt.id,
        year: currentYear,
        totalDays: lt.daysPerYear,
        usedDays: 0,
      },
    });

    await prisma.leaveBalance.upsert({
      where: {
        userId_leaveTypeId_year: {
          userId: manager.id,
          leaveTypeId: lt.id,
          year: currentYear,
        },
      },
      update: {},
      create: {
        userId: manager.id,
        leaveTypeId: lt.id,
        year: currentYear,
        totalDays: lt.daysPerYear,
        usedDays: 0,
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('Employee login: employee@proteccio.com / Password123');
  console.log('Manager login:  manager@proteccio.com / Password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
