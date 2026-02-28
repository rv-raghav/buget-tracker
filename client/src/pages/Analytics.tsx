import { useEffect, useMemo } from 'react';
import { useAppStore } from '../store';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

export default function Analytics() {
  const { analytics, history, fetchAnalytics, fetchHistory } = useAppStore();

  useEffect(() => {
    fetchAnalytics();
    fetchHistory();
  }, []);

  const categoryData = useMemo(() => {
    if (!analytics) return [];
    return Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name),
    }));
  }, [analytics]);

  const savingsData = useMemo(() => {
    return history.map((c) => ({
      label: formatDate(c.creditedAt),
      salary: c.salaryAmount,
      spent: c.totalExpenses,
      saved: c.totalSaved,
      rate: c.savingsRate,
    }));
  }, [history]);

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Analytics</h2>

      {/* Current Cycle Overview */}
      {analytics && (
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Current Cycle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99,102,241,0.06)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Salary</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{formatCurrency(analytics.salaryAmount)}</p>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239,68,68,0.06)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Spent</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-danger)' }}>{formatCurrency(analytics.totalExpenses)}</p>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16,185,129,0.06)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Remaining</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent)' }}>{formatCurrency(analytics.remaining)}</p>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245,158,11,0.06)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Expenses</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{analytics.expenseCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Pie */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Historical: Savings vs Spending */}
      {savingsData.length > 0 && (
        <>
          <div className="card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Spending vs Savings</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" fontSize={10} stroke="var(--color-text-secondary)" />
                <YAxis fontSize={10} stroke="var(--color-text-secondary)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="spent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spent" />
                <Bar dataKey="saved" fill="#10b981" radius={[4, 4, 0, 0]} name="Saved" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Savings Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" fontSize={10} stroke="var(--color-text-secondary)" />
                <YAxis fontSize={10} stroke="var(--color-text-secondary)" tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Line type="monotone" dataKey="rate" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-primary)' }} name="Savings Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!analytics && savingsData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</p>
          <p>No data yet. Start tracking to see analytics.</p>
        </div>
      )}
    </div>
  );
}
