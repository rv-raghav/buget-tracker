import { create } from 'zustand';
import { api } from '../services/api';
import type { SalaryCycle, DefaultExpense, Analytics, HistoricalCycle, AiRecommendation } from '../types';

// ─── Theme Store ────────────────────────────────────────
interface ThemeStore {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
  toggle: () => set((s) => {
    const next = !s.dark;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return { dark: next };
  }),
}));

// ─── Toast Store ────────────────────────────────────────
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, type: 'success' | 'error') => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type) => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// ─── App Store (main data) ─────────────────────────────
interface AppStore {
  // Cycle
  activeCycle: SalaryCycle | null;
  loading: boolean;
  error: string | null;
  
  // Analytics
  analytics: Analytics | null;
  history: HistoricalCycle[];
  
  // Defaults
  defaults: DefaultExpense[];
  
  // AI
  recommendation: AiRecommendation | null;
  
  // Actions
  fetchActiveCycle: () => Promise<void>;
  createSalary: (amount: number) => Promise<SalaryCycle | null>;
  updateSalary: (amount: number) => Promise<void>;
  deleteCycle: () => Promise<void>;
  addExpense: (data: { amount: number; category: string; note?: string }) => Promise<void>;
  updateExpense: (id: string, data: { amount?: number; category?: string; note?: string }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  fetchDefaults: () => Promise<void>;
  addDefault: (data: { name: string; amount: number }) => Promise<void>;
  updateDefault: (id: string, data: { name?: string; amount?: number; isActive?: boolean }) => Promise<void>;
  deleteDefault: (id: string) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  getRecommendation: (savedAmount: number, breakdown: Record<string, number>, salary: number, cycleId?: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeCycle: null,
  loading: false,
  error: null,
  analytics: null,
  history: [],
  defaults: [],
  recommendation: null,

  fetchActiveCycle: async () => {
    set({ loading: true, error: null });
    try {
      const cycle = await api.getCurrentCycle() as SalaryCycle;
      set({ activeCycle: cycle, loading: false });
    } catch (err: any) {
      set({ activeCycle: null, loading: false });
    }
  },

  createSalary: async (amount: number) => {
    set({ loading: true });
    try {
      const cycle = await api.createSalary(amount) as SalaryCycle;
      set({ activeCycle: cycle, loading: false });
      useToastStore.getState().add('Salary cycle created!', 'success');
      return cycle;
    } catch (err: any) {
      set({ loading: false });
      useToastStore.getState().add(err.message, 'error');
      return null;
    }
  },

  updateSalary: async (amount: number) => {
    try {
      const cycle = await api.updateSalary(amount) as SalaryCycle;
      set({ activeCycle: cycle });
      useToastStore.getState().add('Salary updated!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  deleteCycle: async () => {
    try {
      await api.deleteCycle();
      set({ activeCycle: null });
      useToastStore.getState().add('Cycle deleted!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  addExpense: async (data) => {
    try {
      await api.addExpense(data);
      await get().fetchActiveCycle();
      useToastStore.getState().add('Expense added!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  updateExpense: async (id, data) => {
    try {
      await api.updateExpense(id, data);
      await get().fetchActiveCycle();
      useToastStore.getState().add('Expense updated!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.deleteExpense(id);
      await get().fetchActiveCycle();
      useToastStore.getState().add('Expense deleted!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  fetchDefaults: async () => {
    try {
      const defaults = await api.getDefaults() as DefaultExpense[];
      set({ defaults });
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  addDefault: async (data) => {
    try {
      await api.addDefault(data);
      await get().fetchDefaults();
      useToastStore.getState().add('Default added!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  updateDefault: async (id, data) => {
    try {
      await api.updateDefault(id, data);
      await get().fetchDefaults();
      useToastStore.getState().add('Default updated!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  deleteDefault: async (id) => {
    try {
      await api.deleteDefault(id);
      await get().fetchDefaults();
      useToastStore.getState().add('Default deleted!', 'success');
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },

  fetchAnalytics: async () => {
    try {
      const analytics = await api.getCurrentAnalytics() as Analytics;
      set({ analytics });
    } catch {
      set({ analytics: null });
    }
  },

  fetchHistory: async () => {
    try {
      const history = await api.getHistoricalAnalytics() as HistoricalCycle[];
      set({ history });
    } catch {
      set({ history: [] });
    }
  },

  getRecommendation: async (savedAmount, breakdown, salary, cycleId) => {
    try {
      const rec = await api.getRecommendation({
        savedAmount,
        expenseBreakdown: breakdown,
        totalSalary: salary,
        salaryCycleId: cycleId,
      }) as AiRecommendation;
      set({ recommendation: rec });
    } catch (err: any) {
      useToastStore.getState().add(err.message, 'error');
    }
  },
}));
