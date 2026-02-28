# Architecture Overview

## System Design

```
┌─────────────────────────────────────────┐
│               Client (PWA)              │
│  React + TypeScript + Tailwind CSS      │
│  Zustand State │ React Router │ Recharts│
│  Port 5173 (dev)                        │
└──────────────┬──────────────────────────┘
               │ REST API (JSON)
┌──────────────▼──────────────────────────┐
│          Server (Express 5)             │
│  Routes → Controllers → Services       │
│  Zod Validation │ Error Middleware      │
│  Port 5000                              │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────┐
│        PostgreSQL (Neon)                │
│  SalaryCycle │ Expense                  │
│  DefaultExpense │ SavingsDecision       │
└─────────────────────────────────────────┘
```

## Salary Cycle Flow

1. User adds salary → `POST /api/salary`
2. If an ACTIVE cycle exists:
   - Calculate total expenses
   - Calculate savings (salary - expenses)
   - Mark as CLOSED with `closedAt` timestamp
3. Create new ACTIVE cycle
4. Auto-apply all active DefaultExpenses as Expense records
5. All operations happen in a Prisma `$transaction` (atomic)

## Database Schema

### SalaryCycle
Core entity. Represents one salary period.
- `status`: ACTIVE (current) or CLOSED (historical)
- `totalExpenses` / `totalSaved`: Computed on close

### Expense
Individual spending record linked to a cycle.
- `isDefault`: True if auto-created from DefaultExpense
- `category`: Food, Transport, Entertainment, Shopping, Health, Bills, Education, Other

### DefaultExpense
Recurring expenses auto-applied to each new cycle.
- `isActive`: Toggle to include/exclude from auto-apply

### SavingsDecision
AI recommendation snapshot per cycle.
- `aiSuggestions`: JSON with allocation breakdown
- `userChoice`: What the user decided to do

## AI Recommendation Engine

Rule-based engine in `server/src/services/aiService.ts`:

| Savings | Strategy |
|---------|----------|
| ≤ 0 | Warning: overspent |
| < ₹5,000 | 100% emergency fund |
| < ₹10,000 | 50% emergency, 30% invest, 20% fun |
| < ₹20,000 | 30% emergency, 40% invest, 10% SIP, rest fun |
| ≥ ₹20,000 | 20% emergency, 40% invest, 15% SIP, 15% fun, 10% debt |

Additional category-specific advice for high food/entertainment spending.
