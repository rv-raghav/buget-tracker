import { useEffect, useState } from 'react';
import { Layers, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/format';

export default function Defaults() {
  const { defaults, fetchDefaults, addDefault, updateDefault, deleteDefault } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '' });

  useEffect(() => { fetchDefaults(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amount || Number(form.amount) <= 0) return;
    await addDefault({ name: form.name, amount: Number(form.amount) });
    setForm({ name: '', amount: '' });
    setShowAdd(false);
  };

  const startEdit = (d: { id: string; name: string; amount: number }) => {
    setEditId(d.id);
    setEditForm({ name: d.name, amount: String(d.amount) });
  };

  const saveEdit = async () => {
    if (!editId || !editForm.name || Number(editForm.amount) <= 0) return;
    await updateDefault(editId, { name: editForm.name, amount: Number(editForm.amount) });
    setEditId(null);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Default Expenses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={16} /> Add</button>
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        These are automatically added when you start a new salary cycle (SIP, Rent, etc.)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {defaults.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            No defaults yet. Add fixed expenses like SIP, Rent, etc.
          </div>
        )}
        {defaults.map((d) => (
          <div key={d.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem' }}>
            {editId === d.id ? (
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ flex: 1 }} />
                <input className="input" type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} style={{ width: '120px' }} />
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}><X size={14} /></button>
              </div>
            ) : (
              <>
                <div className="icon-glass" style={{ flexShrink: 0 }}>
                  <Layers size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{d.name}</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>{formatCurrency(d.amount)}</p>
                </div>
                <button className={`toggle ${d.isActive ? 'active' : ''}`} onClick={() => updateDefault(d.id, { isActive: !d.isActive })}>
                  <div className="toggle-knob" />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(d)}><Pencil size={14} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteDefault(d.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
              </>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem' }}>Add Default Expense</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Name</label>
                <input className="input" placeholder="SIP Investment" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Amount (₹)</label>
                <input className="input" type="number" placeholder="5000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Add Default</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
