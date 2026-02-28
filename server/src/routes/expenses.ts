import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as expenseService from '../services/expenseService.js';

const router = Router();

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Education', 'Default', 'Other'];

const addExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  note: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const updateExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  category: z.string().min(1).optional(),
  note: z.string().optional(),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = addExpenseSchema.parse(req.body);
    const expense = await expenseService.addExpense(parsed);
    res.status(201).json(expense);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    if (err instanceof Error && err.message.includes('No active salary cycle')) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
});

router.get('/current', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await expenseService.getExpensesForActiveCycle();
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

router.get('/categories', (_req: Request, res: Response) => {
  res.json(CATEGORIES);
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateExpenseSchema.parse(req.body);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const expense = await expenseService.updateExpense(id, parsed);
    res.json(expense);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await expenseService.deleteExpense(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
