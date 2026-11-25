import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderRef = params.get('ref') || 'KF-000001';
  const method = params.get('method') || 'razorpay';

  return (
    <div className="status-page-shell">
      <div className="status-card">
        <div className="status-logo-row">
          <Link to="/" aria-label="Kushi Dairy Home">
            <Logo variant="dark" width={148} height={40} />
          </Link>
        </div>

        <div className="status-check-circle" aria-hidden="true">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <span className="eyebrow" style={{ marginBottom: '6px' }}>
          {method === 'cod' ? 'ORDER PLACED (CASH ON DELIVERY)' : 'PAYMENT CONFIRMED'}
        </span>
        <h1 className="status-title">
          Thank you! Your order is{' '}
          <span className="editorial-italic">on the way soon.</span>
        </h1>
        <p className="status-desc">
          We’ve received your order at our Chaparam store. Keep your order
          reference handy to track delivery progress.
        </p>

        <div className="order-ref-pill">
          <span>Order Reference</span>
          <strong>{orderRef}</strong>
        </div>

        <div className="status-actions">
          <Link
            to={`/track?ref=${encodeURIComponent(orderRef)}`}
            className="btn-primary"
          >
            Track Your Order →
          </Link>
          <Link to="/" className="btn-outline">
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
