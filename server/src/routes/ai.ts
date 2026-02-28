import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateRecommendation } from '../services/aiService.js';
import prisma from '../lib/prisma.js';

const router = Router();

const recommendationSchema = z.object({
  savedAmount: z.number(),
  expenseBreakdown: z.record(z.string(), z.number()),
  totalSalary: z.number().positive(),
  salaryCycleId: z.string().optional(),
});

router.post('/recommendation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = recommendationSchema.parse(req.body);
    const recommendation = generateRecommendation(
      parsed.savedAmount,
      parsed.expenseBreakdown,
      parsed.totalSalary
    );

    // Save the decision if cycle ID provided
    if (parsed.salaryCycleId) {
      await prisma.savingsDecision.upsert({
        where: { salaryCycleId: parsed.salaryCycleId },
        update: {
          savedAmount: parsed.savedAmount,
          aiSuggestions: recommendation as any,
        },
        create: {
          salaryCycleId: parsed.salaryCycleId,
          savedAmount: parsed.savedAmount,
          aiSuggestions: recommendation as any,
        },
      });
    }

    res.json(recommendation);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

export default router;
