import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { ChartLine, PiggyBank, Shield, Sparkles, WalletCards } from 'lucide-react';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/format';

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
    activeCycle.expenses.forEach((e) => {
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Sparkles size={32} /></div>
        <p>No active cycle. Add salary first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>AI Savings Advisor</h2>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.06))' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Current Cycle Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
          <div><p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Salary</p><p style={{ fontSize: '1.1rem', fontWeight: '700' }}>{formatCurrency(activeCycle.salaryAmount)}</p></div>
          <div><p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Spent</p><p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-danger)' }}>{formatCurrency(totals.spent)}</p></div>
          <div><p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Saved</p><p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-accent)' }}>{formatCurrency(totals.saved)}</p></div>
        </div>
      </div>

      {!showRec && (
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleGetRec}>
          <Sparkles size={17} /> Get AI Recommendation
        </button>
      )}

      {showRec && recommendation && (
        <div className="card" style={{ borderColor: 'rgba(99,102,241,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>AI Recommendation</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
            {recommendation.emergencyFund > 0 && <Stat icon={<Shield size={14} />} title="Emergency Fund" value={recommendation.emergencyFund} color="var(--color-accent)" />}
            {recommendation.investment > 0 && <Stat icon={<ChartLine size={14} />} title="Investment" value={recommendation.investment} color="var(--color-primary-light)" />}
            {recommendation.sipIncrease > 0 && <Stat icon={<PiggyBank size={14} />} title="SIP Increase" value={recommendation.sipIncrease} color="var(--color-warning)" />}
            {recommendation.guiltFreeSpend > 0 && <Stat icon={<WalletCards size={14} />} title="Guilt-Free" value={recommendation.guiltFreeSpend} color="#a855f7" />}
            {recommendation.debtPayment > 0 && <Stat icon={<WalletCards size={14} />} title="Debt/Extra" value={recommendation.debtPayment} color="var(--color-danger)" />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recommendation.reasoning.map((r, i) => (
              <p key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                {r}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, title, value, color }: { icon: ReactNode; title: string; value: number; color: string }) {
  return (
    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
      <p style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>{icon} {title}</p>
      <p style={{ fontSize: '1.05rem', fontWeight: '700', color }}>{formatCurrency(value)}</p>
    </div>
  );
}
