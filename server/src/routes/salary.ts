import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as salaryService from '../services/salaryService.js';

const router = Router();

const createSalarySchema = z.object({
  salaryAmount: z.number().positive('Salary must be positive'),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSalarySchema.parse(req.body);
    const cycle = await salaryService.createSalaryCycle(parsed.salaryAmount);
    res.status(201).json(cycle);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.get('/current', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cycle = await salaryService.getActiveCycle();
    if (!cycle) {
      res.status(404).json({ error: 'No active salary cycle found' });
      return;
    }
    res.json(cycle);
  } catch (err) {
    next(err);
  }
});

router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await salaryService.getCycleHistory(page, limit);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

router.patch('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSalarySchema.parse(req.body);
    const cycle = await salaryService.updateActiveCycleSalary(parsed.salaryAmount);
    res.json(cycle);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    if (err instanceof Error && err.message.includes('No active salary cycle')) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
});

router.delete('/current', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await salaryService.deleteActiveCycle();
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message.includes('No active salary cycle')) {
      res.status(404).json({ error: err.message });
      return;
    }
    next(err);
  }
});

export default router;
