import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';
import { normalizePhone, isValidPhone } from '../lib/phone';
import { formatINR } from '../context/CartContext';

const STEPS = [
  { key: 'accepted', label: 'Accepted', desc: 'Store confirmed your order' },
  { key: 'on_the_way', label: 'On the way', desc: 'Out for local delivery' },
  { key: 'delivered', label: 'Delivered', desc: 'Freshly delivered' }
];

function getStepIndex(status) {
  if (status === 'accepted') return 0;
  if (status === 'on_the_way') return 1;
  if (status === 'delivered') return 2;
  return -1; // 'placed' starting state
}

export default function Track() {
  const [params] = useSearchParams();
  const [orderRef, setOrderRef] = useState(params.get('ref') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!supabase) {
      setError('Store connection is unavailable.');
      return;
    }

    const cleanRef = orderRef.trim().toUpperCase();
    const cleanPhone = normalizePhone(phone);

    if (!cleanRef) {
      setError('Please enter your Order Reference (e.g., KF-000001).');
      return;
    }
    if (!isValidPhone(cleanPhone)) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke(
        'track-order',
        {
          body: { orderRef: cleanRef, phone: cleanPhone }
        }
      );

      if (fnErr || data?.error) {
        let serverMsg = data?.error;
        if (!serverMsg && fnErr?.context && typeof fnErr.context.json === 'function') {
          try {
            const errBody = await fnErr.context.json();
            serverMsg = errBody?.error;
          } catch {
            // ignore
          }
        }
        throw new Error(serverMsg || fnErr?.message || 'Order not found.');
      }

      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to track order.');
    } finally {
      setLoading(false);
    }
  };

  const activeStep = order ? getStepIndex(order.status) : -1;

  return (
    <div className="status-page-shell" style={{ alignItems: 'flex-start', paddingTop: '48px' }}>
      <div className="status-card" style={{ maxWidth: '640px', textAlign: 'left' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '22px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <Link to="/" aria-label="Kushi Dairy Home">
            <Logo variant="dark" width={142} height={38} />
          </Link>
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--brand-blue)'
            }}
          >
            ← Back to Store
          </Link>
        </div>

        <span className="eyebrow">ORDER TRACKING</span>
        <h1 style={{ fontSize: '1.7rem', marginBottom: '6px' }}>
          Track your <span className="editorial-italic">Kushi order.</span>
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}
        >
          Enter both your Order Reference and 10-digit mobile number to view
          live delivery status.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="guest-inputs" style={{ marginBottom: '14px' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="trackRef">Order Reference *</label>
              <input
                type="text"
                id="trackRef"
                placeholder="e.g., KF-000001"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="trackPhone">10-Digit Mobile Number *</label>
              <input
                type="tel"
                id="trackPhone"
                placeholder="e.g., 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', height: '46px' }}
            disabled={loading}
          >
            {loading ? 'Checking Order...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="checkout-error" style={{ marginTop: '16px', marginBottom: 0 }} role="alert">
            <strong>Unable to Track</strong>
            <p>{error}</p>
          </div>
        )}

        {order && (
          <div className="track-result-box">
            <div className="track-result-head">
              <div>
                <span className="eyebrow" style={{ marginBottom: '2px' }}>
                  {order.order_ref}
                </span>
                <h2 style={{ fontSize: '1.2rem' }}>
                  {order.status === 'placed'
                    ? 'Order Placed — Waiting for store confirmation'
                    : STEPS[activeStep]?.label}
                </h2>
              </div>
              <span className="track-area-pill">
                Delivery Area: {order.delivery_area}
              </span>
            </div>

            {/* 3-Step Stepper: Accepted -> On the way -> Delivered */}
            <div className="track-stepper" aria-label="Order progress">
              {STEPS.map((step, idx) => {
                const done = activeStep >= idx;
                return (
                  <div
                    key={step.key}
                    className={`track-step${done ? ' done' : ''}`}
                  >
                    <div className="track-step-dot">{done ? '✓' : idx + 1}</div>
                    <div>
                      <strong>{step.label}</strong>
                      <span>{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="track-items-box">
              <strong
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.82rem',
                  marginBottom: '8px',
                  color: 'var(--text-secondary)'
                }}
              >
                ORDER ITEMS
              </strong>
              {(order.items || []).map((item, idx) => (
                <div className="summary-row" key={idx}>
                  <span>
                    {item.product_name} ({item.variant_label}) × {item.qty}
                  </span>
                  <span>{formatINR(item.line_total)}</span>
                </div>
              ))}
              <div
                className="summary-row"
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  marginTop: '6px'
                }}
              >
                <span>Delivery Fee</span>
                <span>
                  {Number(order.delivery_fee) === 0
                    ? 'FREE'
                    : formatINR(order.delivery_fee)}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
