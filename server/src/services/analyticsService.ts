import prisma from '../lib/prisma.js';
import { CycleStatus } from '../../generated/prisma/client.js';

export async function getCurrentAnalytics() {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
    select: { id: true, salaryAmount: true, creditedAt: true },
  });

  if (!activeCycle) {
    return null;
  }

  const [totals, categoryRows, dailyRows] = await Promise.all([
    prisma.expense.aggregate({
      where: { salaryCycleId: activeCycle.id },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: { salaryCycleId: activeCycle.id },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({
      where: { salaryCycleId: activeCycle.id },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const totalExpenses = totals._sum.amount ?? 0;
  const remaining = activeCycle.salaryAmount - totalExpenses;
  const spentPercent = activeCycle.salaryAmount > 0
    ? (totalExpenses / activeCycle.salaryAmount) * 100
    : 0;

  const categoryBreakdown = Object.fromEntries(
    categoryRows.map((row) => [row.category, row._sum.amount ?? 0]),
  );

  const dailySpending: Record<string, number> = {};
  for (const row of dailyRows) {
    const date = row.createdAt.toISOString().split('T')[0];
    dailySpending[date] = (dailySpending[date] || 0) + row.amount;
  }

  return {
    cycleId: activeCycle.id,
    salaryAmount: activeCycle.salaryAmount,
    totalExpenses,
    remaining,
    spentPercent: Math.round(spentPercent * 100) / 100,
    categoryBreakdown,
    dailySpending,
    expenseCount: totals._count.id,
    creditedAt: activeCycle.creditedAt,
  };
}

export async function getHistoricalAnalytics() {
  const closedCycles = await prisma.salaryCycle.findMany({
    where: { status: CycleStatus.CLOSED },
    orderBy: { creditedAt: 'asc' },
    select: {
      id: true,
      salaryAmount: true,
      totalExpenses: true,
      totalSaved: true,
      creditedAt: true,
      closedAt: true,
    },
  });

  if (closedCycles.length === 0) {
    return [];
  }

  const cycleIds = closedCycles.map((cycle) => cycle.id);
  const groupedExpenses = await prisma.expense.groupBy({
    by: ['salaryCycleId', 'category'],
    where: { salaryCycleId: { in: cycleIds } },
    _sum: { amount: true },
  });

  const categoryByCycle: Record<string, Record<string, number>> = {};
  for (const row of groupedExpenses) {
    if (!categoryByCycle[row.salaryCycleId]) {
      categoryByCycle[row.salaryCycleId] = {};
    }

    categoryByCycle[row.salaryCycleId][row.category] = row._sum.amount ?? 0;
  }

  return closedCycles.map((cycle) => {
    const totalSaved = cycle.totalSaved || 0;

    return {
      cycleId: cycle.id,
      salaryAmount: cycle.salaryAmount,
      totalExpenses: cycle.totalExpenses || 0,
      totalSaved,
      creditedAt: cycle.creditedAt,
      closedAt: cycle.closedAt,
      categoryBreakdown: categoryByCycle[cycle.id] || {},
      savingsRate: cycle.salaryAmount > 0
        ? Math.round((totalSaved / cycle.salaryAmount) * 10000) / 100
        : 0,
    };
  });
}
