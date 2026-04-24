import prisma from '../lib/prisma.js';
import { CycleStatus } from '../../generated/prisma/client.js';

async function getActiveCycleId() {
  const activeCycle = await prisma.salaryCycle.findFirst({
    where: { status: CycleStatus.ACTIVE },
    select: { id: true },
  });

  return activeCycle?.id ?? null;
}

export async function addExpense(data: {
  amount: number;
  category: string;
  note?: string;
  isDefault?: boolean;
}) {
  const activeCycleId = await getActiveCycleId();

  if (!activeCycleId) {
    throw new Error('No active salary cycle. Please add your salary first.');
  }

  return prisma.expense.create({
    data: {
      salaryCycleId: activeCycleId,
      amount: data.amount,
      category: data.category,
      note: data.note || null,
      isDefault: data.isDefault || false,
    },
  });
}

export async function getExpensesForActiveCycle() {
  const activeCycleId = await getActiveCycleId();

  if (!activeCycleId) {
    return [];
  }

  return prisma.expense.findMany({
    where: { salaryCycleId: activeCycleId },
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
