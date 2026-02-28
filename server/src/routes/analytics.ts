import { Router, Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = Router();

router.get('/current', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await analyticsService.getCurrentAnalytics();
    if (!analytics) {
      res.status(404).json({ error: 'No active salary cycle found' });
      return;
    }
    res.json(analytics);
  } catch (err) {
    next(err);
  }
});

router.get('/history', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await analyticsService.getHistoricalAnalytics();
    res.json(history);
  } catch (err) {
    next(err);
  }
});

export default router;
