import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err.message);

  if (err.message.includes('Record to update not found') || err.message.includes('Record to delete does not exist')) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  if (err.message.includes('No active salary cycle')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
