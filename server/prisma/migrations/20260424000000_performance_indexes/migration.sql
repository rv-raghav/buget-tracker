-- Performance indexes for frequently used filters/orderings
CREATE INDEX IF NOT EXISTS "SalaryCycle_status_creditedAt_idx"
  ON "SalaryCycle"("status", "creditedAt");

CREATE INDEX IF NOT EXISTS "Expense_salaryCycleId_createdAt_idx"
  ON "Expense"("salaryCycleId", "createdAt");

CREATE INDEX IF NOT EXISTS "Expense_salaryCycleId_category_idx"
  ON "Expense"("salaryCycleId", "category");

CREATE INDEX IF NOT EXISTS "DefaultExpense_isActive_idx"
  ON "DefaultExpense"("isActive");
