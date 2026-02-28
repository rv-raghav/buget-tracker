import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../store';
import { formatCurrency, formatDate, getCategoryColor, getCategoryEmoji } from '../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Education', 'Other'];

export default function Dashboard() {
  const { activeCycle, loading, fetchActiveCycle, addExpense, updateExpense, deleteExpense, createSalary, updateSalary, deleteCycle } = useAppStore();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddSalary, setShowAddSalary] = useState(false);
  const [expForm, setExpForm] = useState({ amount: '', category: 'Food', note: '' });
  const [salaryAmount, setSalaryAmount] = useState('');

  // Edit states
  const [editingSalary, setEditingSalary] = useState(false);
  const [editSalaryVal, setEditSalaryVal] = useState('');
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [editExpForm, setEditExpForm] = useState({ amount: '', category: '', note: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { fetchActiveCycle(); }, []);

  const totals = useMemo(() => {
    if (!activeCycle) return { spent: 0, remaining: 0, percent: 0 };
    const spent = activeCycle.expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = activeCycle.salaryAmount - spent;
    const percent = activeCycle.salaryAmount > 0 ? (spent / activeCycle.salaryAmount) * 100 : 0;
    return { spent, remaining, percent };
  }, [activeCycle]);

  const categoryData = useMemo(() => {
    if (!activeCycle) return [];
    const map: Record<string, number> = {};
    activeCycle.expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name),
    }));
  }, [activeCycle]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.amount || Number(expForm.amount) <= 0) return;
    await addExpense({ amount: Number(expForm.amount), category: expForm.category, note: expForm.note || undefined });
    setExpForm({ amount: '', category: 'Food', note: '' });
    setShowAddExpense(false);
  };

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryAmount || Number(salaryAmount) <= 0) return;
    await createSalary(Number(salaryAmount));
    setSalaryAmount('');
    setShowAddSalary(false);
  };

  const handleEditSalary = async () => {
    if (!editSalaryVal || Number(editSalaryVal) <= 0) return;
    await updateSalary(Number(editSalaryVal));
    setEditingSalary(false);
  };

  const startEditExpense = (exp: { id: string; amount: number; category: string; note: string | null }) => {
    setEditExpenseId(exp.id);
    setEditExpForm({ amount: String(exp.amount), category: exp.category, note: exp.note || '' });
  };

  const handleEditExpense = async () => {
    if (!editExpenseId || !editExpForm.amount || Number(editExpForm.amount) <= 0) return;
    await updateExpense(editExpenseId, {
      amount: Number(editExpForm.amount),
      category: editExpForm.category,
      note: editExpForm.note || undefined,
    });
    setEditExpenseId(null);
  };

  // No active cycle
  if (!loading && !activeCycle) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '1.5rem', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>💰</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>No Active Salary Cycle</h2>
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '360px' }}>
          Add your salary to start tracking expenses for this cycle.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => setShowAddSalary(true)}>
          + Add Salary
        </button>

        {showAddSalary && (
          <div className="modal-overlay" onClick={() => setShowAddSalary(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem' }}>Add Salary</h3>
              <form onSubmit={handleAddSalary} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Salary Amount (₹)</label>
                  <input className="input" type="number" placeholder="50000" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} autoFocus />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Start New Cycle
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading && !activeCycle) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: '200px' }}></div>
        <div className="skeleton" style={{ height: '120px' }}></div>
        <div className="skeleton" style={{ height: '60px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', paddingBottom: '5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      {/* Salary Summary Card */}
      <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.1))', filter: 'blur(20px)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remaining</p>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: '1.1', color: totals.remaining >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
              {formatCurrency(totals.remaining)}
            </h1>
          </div>
          {/* Progress Ring */}
          <svg width="80" height="80" className="progress-ring" style={{ flexShrink: 0 }}>
            <circle cx="40" cy="40" r={35} fill="none" stroke="var(--color-border)" strokeWidth="6" />
            <circle
              className="progress-ring-circle"
              cx="40" cy="40" r={35}
              fill="none"
              stroke={totals.percent > 80 ? 'var(--color-danger)' : totals.percent > 60 ? 'var(--color-warning)' : 'var(--color-primary)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={Math.PI * 70}
              strokeDashoffset={Math.PI * 70 - (Math.min(totals.percent, 100) / 100) * Math.PI * 70}
            />
            <text x="40" y="44" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="700" style={{ transform: 'rotate(90deg)', transformOrigin: '40px 40px' }}>
              {Math.round(totals.percent)}%
            </text>
          </svg>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
          {/* Editable Salary */}
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Salary</p>
            {editingSalary ? (
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <input
                  className="input"
                  type="number"
                  value={editSalaryVal}
                  onChange={(e) => setEditSalaryVal(e.target.value)}
                  style={{ width: '100px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSalary()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleEditSalary} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>✓</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingSalary(false)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>✕</button>
              </div>
            ) : (
              <p
                style={{ fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', borderBottom: '1px dashed var(--color-border)' }}
                onClick={() => { setEditSalaryVal(String(activeCycle!.salaryAmount)); setEditingSalary(true); }}
                title="Click to edit"
              >
                {formatCurrency(activeCycle!.salaryAmount)} ✎
              </p>
            )}
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Spent</p>
            <p style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-danger)' }}>{formatCurrency(totals.spent)}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Since</p>
            <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{formatDate(activeCycle!.creditedAt)}</p>
          </div>
        </div>
      </div>

      {/* Category Pie Chart */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Spending by Category</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}>
              {categoryData.map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{c.name}</span>
                  <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
          Expenses ({activeCycle!.expenses.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {activeCycle!.expenses.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
              <p>No expenses yet. Tap + to add one.</p>
            </div>
          )}
          {activeCycle!.expenses.map((exp) => (
            <div key={exp.id} className="card" style={{ padding: '1rem 1.25rem' }}>
              {editExpenseId === exp.id ? (
                /* Inline Edit Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="input"
                      type="number"
                      value={editExpForm.amount}
                      onChange={(e) => setEditExpForm({ ...editExpForm, amount: e.target.value })}
                      placeholder="Amount"
                      style={{ flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.85rem' }}
                      autoFocus
                    />
                    <select
                      className="select"
                      value={editExpForm.category}
                      onChange={(e) => setEditExpForm({ ...editExpForm, category: e.target.value })}
                      style={{ flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.85rem' }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="input"
                      value={editExpForm.note}
                      onChange={(e) => setEditExpForm({ ...editExpForm, note: e.target.value })}
                      placeholder="Note"
                      style={{ flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.85rem' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleEditExpense}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditExpenseId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: `${getCategoryColor(exp.category)}15`, flexShrink: 0 }}>
                    {getCategoryEmoji(exp.category)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => startEditExpense(exp)} title="Click to edit">
                    <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{exp.note || exp.category}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                      {exp.category} {exp.isDefault && <span className="badge badge-primary" style={{ marginLeft: '0.25rem', fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>Default</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => startEditExpense(exp)} title="Click to edit">
                    <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{formatCurrency(exp.amount)}</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}
                    onClick={() => startEditExpense(exp)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                    onClick={() => deleteExpense(exp.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cycle Actions */}
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
          Salary credited? Close this cycle and start fresh.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button className="btn btn-accent" onClick={() => setShowAddSalary(true)}>
            + New Salary Cycle
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
            🗑 Delete Cycle
          </button>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAddExpense(true)} id="fab-add-expense">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem' }}>Add Expense</h3>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Amount (₹)</label>
                <input className="input" type="number" placeholder="500" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Category</label>
                <select className="select" value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryEmoji(c)} {c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Note (optional)</label>
                <input className="input" type="text" placeholder="Zomato order" value={expForm.note} onChange={(e) => setExpForm({ ...expForm, note: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Salary Modal */}
      {showAddSalary && (
        <div className="modal-overlay" onClick={() => setShowAddSalary(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>New Salary Cycle</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              This will close your current cycle and calculate savings.
            </p>
            <form onSubmit={handleAddSalary} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Salary Amount (₹)</label>
                <input className="input" type="number" placeholder="50000" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} autoFocus />
              </div>
              <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%' }}>
                Start New Cycle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Cycle Confirmation */}
      {showDeleteConfirm && (
        <div className="confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Delete Current Cycle?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              This will permanently delete this salary cycle and all its expenses. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={async () => { await deleteCycle(); setShowDeleteConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
