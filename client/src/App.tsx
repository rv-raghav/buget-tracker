import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useThemeStore, useToastStore } from './store';
import Dashboard from './pages/Dashboard';
import Defaults from './pages/Defaults';
import Analytics from './pages/Analytics';
import Advisor from './pages/Advisor';

function Layout({ children }: { children: React.ReactNode }) {
  const { dark, toggle } = useThemeStore();
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(var(--color-surface), 0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>💰</span>
          <h1 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.02em' }}>BudgetFlow</h1>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={toggle} style={{ fontSize: '1.1rem' }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.375rem 0.5rem',
        zIndex: 40,
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))',
      }}>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <span style={{ fontSize: '1.1rem' }}>🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/defaults" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.1rem' }}>📌</span>
          <span>Defaults</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.1rem' }}>📊</span>
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/advisor" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          <span>AI</span>
        </NavLink>
      </nav>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
            <span>{t.type === 'success' ? '✓' : '✕'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/defaults" element={<Defaults />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/advisor" element={<Advisor />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
