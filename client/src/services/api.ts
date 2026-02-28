const API_BASE = import.meta.env.VITE_API_URL;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  // Salary
  createSalary: (salaryAmount: number) =>
    request('/salary', { method: 'POST', body: JSON.stringify({ salaryAmount }) }),
  
  getCurrentCycle: () => request('/salary/current'),
  
  getCycleHistory: (page = 1) => request(`/salary/history?page=${page}`),

  updateSalary: (salaryAmount: number) =>
    request('/salary/current', { method: 'PATCH', body: JSON.stringify({ salaryAmount }) }),

  deleteCycle: () =>
    request('/salary/current', { method: 'DELETE' }),

  // Expenses
  addExpense: (data: { amount: number; category: string; note?: string; isDefault?: boolean }) =>
    request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  
  getCurrentExpenses: () => request('/expenses/current'),
  
  getCategories: () => request<string[]>('/expenses/categories'),
  
  updateExpense: (id: string, data: { amount?: number; category?: string; note?: string }) =>
    request(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  deleteExpense: (id: string) =>
    request(`/expenses/${id}`, { method: 'DELETE' }),

  // Defaults
  getDefaults: () => request('/defaults'),
  
  addDefault: (data: { name: string; amount: number }) =>
    request('/defaults', { method: 'POST', body: JSON.stringify(data) }),
  
  updateDefault: (id: string, data: { name?: string; amount?: number; isActive?: boolean }) =>
    request(`/defaults/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  deleteDefault: (id: string) =>
    request(`/defaults/${id}`, { method: 'DELETE' }),

  // Analytics
  getCurrentAnalytics: () => request('/analytics/current'),
  getHistoricalAnalytics: () => request('/analytics/history'),

  // AI
  getRecommendation: (data: {
    savedAmount: number;
    expenseBreakdown: Record<string, number>;
    totalSalary: number;
    salaryCycleId?: string;
  }) => request('/ai/recommendation', { method: 'POST', body: JSON.stringify(data) }),
};
