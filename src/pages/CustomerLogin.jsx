import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useCustomer } from '../context/CustomerContext';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function CustomerLogin() {
  const { isLoggedIn, login, signup } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectTo, { replace: true });
    }
  }, [isLoggedIn, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanAddress = address.trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError(
        'Please enter a valid email address (order receipts & plan expiry reminders are sent here).'
      );
      return;
    }

    if (mode === 'signup' && cleanAddress.length < 5) {
      setError('Please enter your delivery address (House No, Street, Village/Colony, Pincode).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup({ email: cleanEmail, address: cleanAddress, password });
      } else {
        await login({ email: cleanEmail, password });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cust-page-shell">
      <header className="cust-topbar">
        <Link to="/" className="cust-topbar-back">
          ← Back to Store
        </Link>
        <Link to="/" className="cust-topbar-brand" aria-label="Kushi Dairy Home">
          <Logo variant="dark" height={34} />
        </Link>
        <span className="cust-topbar-spacer" aria-hidden="true" />
      </header>

      <main className="cust-auth-main">
        <div className="cust-auth-card">
          <div className="cust-segmented" role="tablist" aria-label="Account mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`cust-seg-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`cust-seg-btn${mode === 'signup' ? ' active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          <span className="eyebrow" style={{ marginBottom: '4px' }}>
            {mode === 'login' ? 'WELCOME BACK' : 'JOIN KUSHI DAIRY'}
          </span>
          <h1 className="cust-auth-title">
            {mode === 'login' ? 'Sign in to your account' : 'Create your Kushi profile'}
          </h1>
          <p className="cust-auth-sub">
            {mode === 'login'
              ? 'View active 1-Month & 3-Month plans, track orders, and reorder in 1 tap.'
              : 'Order receipts and plan expiry reminders are sent directly to your email.'}
          </p>

          {error && (
            <div className="checkout-error" role="alert">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="custEmail">Email Address *</label>
              <input
                type="email"
                id="custEmail"
                placeholder="e.g., you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {mode === 'signup' && (
              <div className="form-field">
                <label htmlFor="custAddress">Delivery Address *</label>
                <input
                  type="text"
                  id="custAddress"
                  placeholder="House No, Street, Village/Colony, Pincode (e.g. 532401)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="custPassword">Password *</label>
              <input
                type="password"
                id="custPassword"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', height: '48px', marginTop: '6px' }}
              disabled={submitting}
            >
              {submitting
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Login to Dashboard →'
                  : 'Create Account →'}
            </button>
          </form>

          <p className="cust-guest-note">
            Prefer ordering without an account?{' '}
            <Link to="/">Continue as Guest on Storefront →</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
