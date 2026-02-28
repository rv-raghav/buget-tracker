export interface SalaryCycle {
  id: string;
  salaryAmount: number;
  creditedAt: string;
  closedAt: string | null;
  status: 'ACTIVE' | 'CLOSED';
  totalExpenses: number | null;
  totalSaved: number | null;
  expenses: Expense[];
  savings: SavingsDecision | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  salaryCycleId: string;
  amount: number;
  category: string;
  note: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface DefaultExpense {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
}

export interface SavingsDecision {
  id: string;
  salaryCycleId: string;
  savedAmount: number;
  userChoice: string | null;
  aiSuggestions: AiRecommendation;
  createdAt: string;
}

export interface AiRecommendation {
  emergencyFund: number;
  investment: number;
  sipIncrease: number;
  guiltFreeSpend: number;
  debtPayment: number;
  reasoning: string[];
}

export interface Analytics {
  cycleId: string;
  salaryAmount: number;
  totalExpenses: number;
  remaining: number;
  spentPercent: number;
  categoryBreakdown: Record<string, number>;
  dailySpending: Record<string, number>;
  expenseCount: number;
  creditedAt: string;
}

export interface HistoricalCycle {
  cycleId: string;
  salaryAmount: number;
  totalExpenses: number;
  totalSaved: number;
  creditedAt: string;
  closedAt: string;
  categoryBreakdown: Record<string, number>;
  savingsRate: number;
}

export interface CycleHistory {
  cycles: SalaryCycle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
