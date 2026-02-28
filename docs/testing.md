# Testing Documentation

## API Curl Tests

### Salary Cycle

```bash
# Create first salary cycle
curl -X POST http://localhost:5000/api/salary \
  -H "Content-Type: application/json" \
  -d '{"salaryAmount":50000}'

# Get active cycle
curl http://localhost:5000/api/salary/current

# Get history
curl http://localhost:5000/api/salary/history

# Validation error (negative amount)
curl -X POST http://localhost:5000/api/salary \
  -H "Content-Type: application/json" \
  -d '{"salaryAmount":-100}'
```

### Expenses

```bash
# Add expense
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"category":"Food","note":"Lunch"}'

# Add transport expense
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount":3000,"category":"Transport","note":"Monthly metro pass"}'

# Get current expenses
curl http://localhost:5000/api/expenses/current

# Get categories
curl http://localhost:5000/api/expenses/categories

# Update expense (replace ID)
curl -X PATCH http://localhost:5000/api/expenses/EXPENSE_ID \
  -H "Content-Type: application/json" \
  -d '{"amount":600,"note":"Updated lunch"}'

# Delete expense
curl -X DELETE http://localhost:5000/api/expenses/EXPENSE_ID
```

### Default Expenses

```bash
# Add default
curl -X POST http://localhost:5000/api/defaults \
  -H "Content-Type: application/json" \
  -d '{"name":"SIP Investment","amount":5000}'

# Add rent default
curl -X POST http://localhost:5000/api/defaults \
  -H "Content-Type: application/json" \
  -d '{"name":"Rent","amount":15000}'

# List defaults
curl http://localhost:5000/api/defaults

# Toggle active/inactive
curl -X PATCH http://localhost:5000/api/defaults/DEFAULT_ID \
  -H "Content-Type: application/json" \
  -d '{"isActive":false}'

# Delete default
curl -X DELETE http://localhost:5000/api/defaults/DEFAULT_ID
```

### Analytics

```bash
# Current cycle analytics
curl http://localhost:5000/api/analytics/current

# Historical analytics
curl http://localhost:5000/api/analytics/history
```

### AI Recommendation

```bash
# Get AI recommendation
curl -X POST http://localhost:5000/api/ai/recommendation \
  -H "Content-Type: application/json" \
  -d '{"savedAmount":10000,"expenseBreakdown":{"Food":5000,"Transport":3000},"totalSalary":50000}'

# Low savings scenario
curl -X POST http://localhost:5000/api/ai/recommendation \
  -H "Content-Type: application/json" \
  -d '{"savedAmount":3000,"expenseBreakdown":{"Food":15000,"Bills":10000},"totalSalary":30000}'

# High savings scenario
curl -X POST http://localhost:5000/api/ai/recommendation \
  -H "Content-Type: application/json" \
  -d '{"savedAmount":25000,"expenseBreakdown":{"Bills":10000},"totalSalary":80000}'
```

### Salary Cycle Close Test

```bash
# 1. Ensure an active cycle exists
curl http://localhost:5000/api/salary/current

# 2. Add some expenses
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount":10000,"category":"Bills","note":"Rent"}'

# 3. Create new salary (closes previous)
curl -X POST http://localhost:5000/api/salary \
  -H "Content-Type: application/json" \
  -d '{"salaryAmount":55000}'

# 4. Verify new cycle is active
curl http://localhost:5000/api/salary/current

# 5. Check history (previous cycle should be CLOSED)
curl http://localhost:5000/api/salary/history
```

## Manual QA Flow

1. **Create Salary**: Open app → Click "Add Salary" → Enter ₹50,000 → Submit
2. **Add Expenses**: Click FAB (+) → Add food ₹500, transport ₹3,000
3. **Verify Dashboard**: Check remaining, progress ring, pie chart
4. **Add Defaults**: Go to Defaults → Add "SIP ₹5,000" and "Rent ₹15,000"
5. **Toggle Default**: Toggle a default inactive, verify toggle UI
6. **New Salary Cycle**: Click "New Salary Cycle" → Enter ₹55,000
7. **Verify Close Logic**: Check that defaults were auto-applied to new cycle
8. **Analytics**: Go to Analytics → Verify charts show historical data
9. **AI Advisor**: Go to AI → Click "Get AI Recommendation" → Verify suggestions
10. **Dark Mode**: Toggle dark mode → Verify all pages look correct
11. **PWA Install**: Open in Chrome → Install as app (if served over HTTPS)
