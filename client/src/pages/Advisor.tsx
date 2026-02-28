import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../store';
import { formatCurrency, formatDate } from '../utils/format';

export default function SalaryHistory() {
  const { activeCycle, fetchActiveCycle, getRecommendation, recommendation } = useAppStore();
  const [showRec, setShowRec] = useState(false);

  useEffect(() => { fetchActiveCycle(); }, []);

  const totals = useMemo(() => {
    if (!activeCycle) return { spent: 0, saved: 0 };
    const spent = activeCycle.expenses.reduce((s, e) => s + e.amount, 0);
    return { spent, saved: activeCycle.salaryAmount - spent };
  }, [activeCycle]);

  const breakdown = useMemo(() => {
    if (!activeCycle) return {};
    const map: Record<string, number> = {};
    activeCycle.expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [activeCycle]);

  const handleGetRec = async () => {
    if (!activeCycle) return;
    await getRecommendation(totals.saved, breakdown, activeCycle.salaryAmount, activeCycle.id);
    setShowRec(true);
  };

  if (!activeCycle) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</p>
        <p>No active cycle. Add salary first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>AI Savings Advisor</h2>

      {/* Current Summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(16,185,129,0.05))' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Current Cycle Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Salary</p>
            <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{formatCurrency(activeCycle.salaryAmount)}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Spent</p>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-danger)' }}>{formatCurrency(totals.spent)}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Saved</p>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent)' }}>{formatCurrency(totals.saved)}</p>
          </div>
        </div>
      </div>

      {/* Get Recommendation Button */}
      {!showRec && (
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleGetRec}>
          🤖 Get AI Recommendation
        </button>
      )}

      {/* AI Recommendations */}
      {showRec && recommendation && (
        <div className="card" style={{ border: '1px solid var(--color-primary)', borderColor: 'rgba(99,102,241,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>AI Recommendation</h3>
          </div>

          {/* Allocation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            {recommendation.emergencyFund > 0 && (
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16,185,129,0.08)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>🛡️ Emergency Fund</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-accent)' }}>{formatCurrency(recommendation.emergencyFund)}</p>
              </div>
            )}
            {recommendation.investment > 0 && (
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99,102,241,0.08)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>📈 Investment</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary)' }}>{formatCurrency(recommendation.investment)}</p>
              </div>
            )}
            {recommendation.sipIncrease > 0 && (
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245,158,11,0.08)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>💎 SIP Increase</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-warning)' }}>{formatCurrency(recommendation.sipIncrease)}</p>
              </div>
            )}
            {recommendation.guiltFreeSpend > 0 && (
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(168,85,247,0.08)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>🎉 Guilt-Free</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#a855f7' }}>{formatCurrency(recommendation.guiltFreeSpend)}</p>
              </div>
            )}
            {recommendation.debtPayment > 0 && (
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239,68,68,0.08)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>💳 Debt/Extra</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-danger)' }}>{formatCurrency(recommendation.debtPayment)}</p>
              </div>
            )}
          </div>

          {/* Reasoning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recommendation.reasoning.map((r, i) => (
              <p key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', padding: '0.5rem 0.75rem', background: 'var(--color-surface-hover)', borderRadius: '8px' }}>
                {r}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
