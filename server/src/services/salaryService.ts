import prisma from '../lib/prisma.js';
import { CycleStatus } from '../../generated/prisma/client.js';

export async function createSalaryCycle(salaryAmount: number) {
  return prisma.$transaction(async (tx) => {
    // 1. Close existing ACTIVE cycle if any
    const activeCycle = await tx.salaryCycle.findFirst({
      where: { status: CycleStatus.ACTIVE },
      include: { expenses: true },
    });

    if (activeCycle) {
      const totalExpenses = activeCycle.expenses.reduce((sum, e) => sum + e.amount, 0);
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

    // 2. Create new cycle
    const newCycle = await tx.salaryCycle.create({
      data: { salaryAmount },
    });

    // 3. Auto-add active default expenses
    const defaults = await tx.defaultExpense.findMany({
      where: { isActive: true },
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

    // Return the new cycle with expenses
    return tx.salaryCycle.findUnique({
      where: { id: newCycle.id },
      include: { expenses: true, savings: true },
    });
  });
}

export async function getActiveCycle() {
  return prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
    include: {
      expenses: { orderBy: { createdAt: 'desc' } },
      savings: true,
    },
  });
}

export async function getCycleHistory(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [cycles, total] = await Promise.all([
    prisma.salaryCycle.findMany({
      where: { status: CycleStatus.CLOSED },
      include: { expenses: true, savings: true },
      orderBy: { creditedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.salaryCycle.count({ where: { status: CycleStatus.CLOSED } }),
  ]);

  return { cycles, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateActiveCycleSalary(salaryAmount: number) {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
  });

  if (!activeCycle) {
    throw new Error('No active salary cycle found');
  }

  return prisma.salaryCycle.update({
    where: { id: activeCycle.id },
    data: { salaryAmount },
    include: {
      expenses: { orderBy: { createdAt: 'desc' } },
      savings: true,
    },
  });
}

export async function deleteActiveCycle() {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
  });

  if (!activeCycle) {
    throw new Error('No active salary cycle found');
  }

  // Cascade delete handles expenses and savings
  await prisma.salaryCycle.delete({
    where: { id: activeCycle.id },
  });

  return { deleted: true };
}
