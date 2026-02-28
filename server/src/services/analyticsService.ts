import prisma from '../lib/prisma.js';
import { CycleStatus } from '../../generated/prisma/client.js';

export async function getCurrentAnalytics() {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
    include: { expenses: true },
  });

  if (!activeCycle) {
    return null;
  }

  const totalExpenses = activeCycle.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = activeCycle.salaryAmount - totalExpenses;
  const spentPercent = activeCycle.salaryAmount > 0
    ? (totalExpenses / activeCycle.salaryAmount) * 100
    : 0;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  activeCycle.expenses.forEach((e) => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
  });

  // Daily spending (for trend)
  const dailySpending: Record<string, number> = {};
  activeCycle.expenses.forEach((e) => {
    const date = e.createdAt.toISOString().split('T')[0];
    dailySpending[date] = (dailySpending[date] || 0) + e.amount;
  });

  return {
    cycleId: activeCycle.id,
    salaryAmount: activeCycle.salaryAmount,
    totalExpenses,
    remaining,
    spentPercent: Math.round(spentPercent * 100) / 100,
    categoryBreakdown,
    dailySpending,
    expenseCount: activeCycle.expenses.length,
    creditedAt: activeCycle.creditedAt,
  };
}

export async function getHistoricalAnalytics() {
  const closedCycles = await prisma.salaryCycle.findMany({
    where: { status: CycleStatus.CLOSED },
    include: { expenses: true },
    orderBy: { creditedAt: 'asc' },
  });

  return closedCycles.map((cycle) => {
    const categoryBreakdown: Record<string, number> = {};
    cycle.expenses.forEach((e) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    return {
      cycleId: cycle.id,
      salaryAmount: cycle.salaryAmount,
      totalExpenses: cycle.totalExpenses || 0,
      totalSaved: cycle.totalSaved || 0,
      creditedAt: cycle.creditedAt,
      closedAt: cycle.closedAt,
      categoryBreakdown,
      savingsRate: cycle.salaryAmount > 0
        ? Math.round(((cycle.totalSaved || 0) / cycle.salaryAmount) * 10000) / 100
        : 0,
    };
  });
}
