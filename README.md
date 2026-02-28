# 💰 BudgetFlow — Personal Salary-Cycle Budget Tracker

A full-stack, salary-cycle based budget tracking PWA. Track expenses per salary cycle, manage recurring defaults, view analytics, and get AI savings recommendations.

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Charts | Recharts |
| Routing | React Router v7 |
| Backend | Node.js + Express 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon) |
| PWA | Service Worker + Manifest |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### 1. Clone & Install

```bash
git clone <repo-url> budget-tracker
cd budget-tracker

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
PORT=5000
```

### 3. Run Database Migration

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development

```bash
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/salary` | Create salary cycle |
| GET | `/api/salary/current` | Get active cycle |
| GET | `/api/salary/history` | Get closed cycles |
| POST | `/api/expenses` | Add expense |
| GET | `/api/expenses/current` | Current expenses |
| PATCH | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/defaults` | List defaults |
| POST | `/api/defaults` | Add default |
| PATCH | `/api/defaults/:id` | Update default |
| DELETE | `/api/defaults/:id` | Delete default |
| GET | `/api/analytics/current` | Current analytics |
| GET | `/api/analytics/history` | Historical data |
| POST | `/api/ai/recommendation` | AI suggestions |

## 🧪 Testing

```bash
# Backend tests
cd server && npm test

# API test examples
curl -X POST http://localhost:5000/api/salary \
  -H "Content-Type: application/json" \
  -d '{"salaryAmount":50000}'

curl http://localhost:5000/api/salary/current

curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"category":"Food","note":"Lunch"}'
```

See `docs/testing.md` for full test documentation.
