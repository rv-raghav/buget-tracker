import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { BarChart3, CircleDollarSign, Home, Layers, Moon, Sparkles, Sun, Wallet, X } from 'lucide-react';
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
    <div className="app-shell">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="icon-glass">
            <Wallet size={18} />
          </div>
          <h1 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
            Budget<span style={{ color: 'var(--color-primary-light)' }}>Flow</span>
          </h1>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={toggle} aria-label="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={18} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/defaults" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Layers size={18} />
          <span>Defaults</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/advisor" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Sparkles size={18} />
          <span>AI</span>
        </NavLink>
      </nav>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
            {t.type === 'success' ? <CircleDollarSign size={16} /> : <X size={16} />}
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
