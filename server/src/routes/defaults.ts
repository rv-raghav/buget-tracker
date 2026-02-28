import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as defaultService from '../services/defaultService.js';

const router = Router();

const addDefaultSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
});

const updateDefaultSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const defaults = await defaultService.getDefaults();
    res.json(defaults);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = addDefaultSchema.parse(req.body);
    const def = await defaultService.addDefault(parsed);
    res.status(201).json(def);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateDefaultSchema.parse(req.body);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const def = await defaultService.updateDefault(id, parsed);
    res.json(def);
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
    await defaultService.deleteDefault(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
