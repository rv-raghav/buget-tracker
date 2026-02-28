import prisma from '../lib/prisma.js';

export async function getDefaults() {
  return prisma.defaultExpense.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function addDefault(data: { name: string; amount: number }) {
  return prisma.defaultExpense.create({
    data: {
      name: data.name,
      amount: data.amount,
      isActive: true,
    },
  });
}

export async function updateDefault(id: string, data: {
  name?: string;
  amount?: number;
  isActive?: boolean;
}) {
  return prisma.defaultExpense.update({
    where: { id },
    data,
  });
}

export async function deleteDefault(id: string) {
  return prisma.defaultExpense.delete({
    where: { id },
  });
}
