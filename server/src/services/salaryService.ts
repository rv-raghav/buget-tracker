import prisma from '../lib/prisma.js';
import { CycleStatus } from '../../generated/prisma/client.js';

const cycleWithRelationsSelect = {
  id: true,
  salaryAmount: true,
  creditedAt: true,
  closedAt: true,
  status: true,
  totalExpenses: true,
  totalSaved: true,
  createdAt: true,
  expenses: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      salaryCycleId: true,
      amount: true,
      category: true,
      note: true,
      isDefault: true,
      createdAt: true,
    },
  },
  savings: true,
};

export async function createSalaryCycle(salaryAmount: number) {
  return prisma.$transaction(async (tx) => {
    const activeCycle = await tx.salaryCycle.findFirst({
      where: { status: CycleStatus.ACTIVE },
      select: { id: true, salaryAmount: true },
    });

    if (activeCycle) {
      const totals = await tx.expense.aggregate({
        where: { salaryCycleId: activeCycle.id },
        _sum: { amount: true },
      });

      const totalExpenses = totals._sum.amount ?? 0;
      const totalSaved = activeCycle.salaryAmount - totalExpenses;

      await tx.salaryCycle.update({
        where: { id: activeCycle.id },
        data: {
          status: CycleStatus.CLOSED,
          closedAt: new Date(),
          totalExpenses,
          totalSaved,
        },
      });
    }

    const newCycle = await tx.salaryCycle.create({
      data: { salaryAmount },
      select: { id: true },
    });

    const defaults = await tx.defaultExpense.findMany({
      where: { isActive: true },
      select: { name: true, amount: true },
    });

    if (defaults.length > 0) {
      await tx.expense.createMany({
        data: defaults.map((d) => ({
          salaryCycleId: newCycle.id,
          amount: d.amount,
          category: 'Default',
          note: d.name,
          isDefault: true,
        })),
      });
    }

    return tx.salaryCycle.findUnique({
      where: { id: newCycle.id },
      select: cycleWithRelationsSelect,
    });
  });
}

export async function getActiveCycle() {
  return prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
    select: cycleWithRelationsSelect,
  });
}

export async function getCycleHistory(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [cycles, total] = await Promise.all([
    prisma.salaryCycle.findMany({
      where: { status: CycleStatus.CLOSED },
      orderBy: { creditedAt: 'desc' },
      skip,
      take: limit,
      select: cycleWithRelationsSelect,
    }),
    prisma.salaryCycle.count({ where: { status: CycleStatus.CLOSED } }),
  ]);

  return { cycles, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateActiveCycleSalary(salaryAmount: number) {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
    select: { id: true },
  });

  if (!activeCycle) {
    throw new Error('No active salary cycle found');
  }

  return prisma.salaryCycle.update({
    where: { id: activeCycle.id },
    data: { salaryAmount },
    select: cycleWithRelationsSelect,
  });
}

export async function deleteActiveCycle() {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
    select: { id: true },
  });

  if (!activeCycle) {
    throw new Error('No active salary cycle found');
  }

  await prisma.salaryCycle.delete({
    where: { id: activeCycle.id },
  });

  return { deleted: true };
}
