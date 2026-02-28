import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import salaryRoutes from './routes/salary.js';
import expenseRoutes from './routes/expenses.js';
import defaultRoutes from './routes/defaults.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/salary', salaryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/defaults', defaultRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
