import prisma from '../lib/prisma.js';
import { CycleStatus } from '../../generated/prisma/client.js';

export async function addExpense(data: {
  amount: number;
  category: string;
  note?: string;
  isDefault?: boolean;
}) {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
  });

  if (!activeCycle) {
    throw new Error('No active salary cycle. Please add your salary first.');
  }

  return prisma.expense.create({
    data: {
      salaryCycleId: activeCycle.id,
      amount: data.amount,
      category: data.category,
      note: data.note || null,
      isDefault: data.isDefault || false,
    },
  });
}

export async function getExpensesForActiveCycle() {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
  });

  if (!activeCycle) {
    return [];
  }

  return prisma.expense.findMany({
    where: { salaryCycleId: activeCycle.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateExpense(id: string, data: {
  amount?: number;
  category?: string;
  note?: string;
}) {
  return prisma.expense.update({
    where: { id },
    data,
  });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({
    where: { id },
  });
}
