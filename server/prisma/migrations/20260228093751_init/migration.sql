-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "SalaryCycle" (
    "id" TEXT NOT NULL,
    "salaryAmount" DOUBLE PRECISION NOT NULL,
    "creditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "status" "CycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalExpenses" DOUBLE PRECISION,
    "totalSaved" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "salaryCycleId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultExpense" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DefaultExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsDecision" (
    "id" TEXT NOT NULL,
    "salaryCycleId" TEXT NOT NULL,
    "savedAmount" DOUBLE PRECISION NOT NULL,
    "userChoice" TEXT,
    "aiSuggestions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavingsDecision_salaryCycleId_key" ON "SavingsDecision"("salaryCycleId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_salaryCycleId_fkey" FOREIGN KEY ("salaryCycleId") REFERENCES "SalaryCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsDecision" ADD CONSTRAINT "SavingsDecision_salaryCycleId_fkey" FOREIGN KEY ("salaryCycleId") REFERENCES "SalaryCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
