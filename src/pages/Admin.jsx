import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import OrdersTab from '../components/admin/OrdersTab';
import ProductsTab from '../components/admin/ProductsTab';
import SettingsTab from '../components/admin/SettingsTab';
import { supabase } from '../lib/supabase';
import '../styles/admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'settings'
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((text) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function guard() {
      if (!supabase) {
        navigate('/admin-login', { replace: true });
        return;
      }

      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) {
        navigate('/admin-login', { replace: true });
        return;
      }

      const { data: adminRow } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        navigate('/admin-login', { replace: true });
        return;
      }

      if (!cancelled) setCheckingAuth(false);
    }

    guard();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/admin-login', { replace: true });
  };

  if (checkingAuth) {
    return (
      <div className="admin-login-shell">
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          Verifying admin session...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand-group">
            <Link to="/" aria-label="Kushi Dairy Storefront">
              <Logo variant="dark" width={132} height={36} />
            </Link>
            <span className="admin-role-pill">Admin Console</span>
          </div>

          <div className="admin-topbar-actions">
            <Link to="/" className="admin-btn-sm">
              View Storefront ↗
            </Link>
            <button className="admin-btn-sm" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button
            className={`admin-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'products' ? ' active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'settings' ? ' active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'orders' && <OrdersTab onNotify={notify} />}
        {activeTab === 'products' && <ProductsTab onNotify={notify} />}
        {activeTab === 'settings' && <SettingsTab onNotify={notify} />}
      </main>

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span className="toast-dot"></span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
