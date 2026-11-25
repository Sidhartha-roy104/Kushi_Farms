import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';
import '../styles/admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data?.session?.user;
      if (!user) return;
      const { data: adminRow } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (adminRow) {
        navigate('/admin', { replace: true });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase client is not configured.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInErr) {
        throw new Error(signInErr.message);
      }

      const user = data?.user;
      if (!user) {
        throw new Error('Authentication failed.');
      }

      const { data: adminRow, error: adminErr } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminErr || !adminRow) {
        await supabase.auth.signOut();
        throw new Error(
          'Access denied. This account is not listed in the store admins table.'
        );
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div style={{ marginBottom: '20px' }}>
          <Link to="/" aria-label="Kushi Dairy Home">
            <Logo variant="dark" width={148} height={40} />
          </Link>
        </div>

        <span className="eyebrow">STORE ADMINISTRATION</span>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>
          Admin Sign In
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}
        >
          Authorized Kushi Dairy Chaparam staff console.
        </p>

        {error && (
          <div className="checkout-error" role="alert">
            <strong>Sign-in Failed</strong>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="adminEmail">Email Address</label>
            <input
              type="email"
              id="adminEmail"
              placeholder="admin@kushifarm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label htmlFor="adminPass">Password</label>
            <input
              type="password"
              id="adminPass"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', height: '46px', marginTop: '4px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In to Admin Console'}
          </button>
        </form>

        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--brand-blue)'
            }}
          >
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
