import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function AdminModal() {
  const { activeOverlay, closeAllOverlays } = useCart();
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isOpen = activeOverlay === 'admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className={`modal-dialog compact${isOpen ? ' open' : ''}`}
      id="adminModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adminModalTitle"
    >
      <button
        className="modal-close-btn"
        aria-label="Close admin modal"
        onClick={closeAllOverlays}
      >
        &times;
      </button>
      <span className="eyebrow">KUSHI DAIRY PRODUCTS</span>
      <h3
        id="adminModalTitle"
        style={{ fontSize: '1.45rem', marginBottom: '6px' }}
      >
        Store Administration
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          marginBottom: '18px'
        }}
      >
        Authorized Chaparam store staff portal for inventory &amp; daily
        pricing.
      </p>
      <form id="adminForm" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="adminUser">Staff ID / Mobile</label>
          <input
            type="text"
            id="adminUser"
            placeholder="e.g., 8464952708"
            value={adminUser}
            onChange={(e) => setAdminUser(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="adminPass">Access PIN</label>
          <input
            type="password"
            id="adminPass"
            placeholder="••••••"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', height: '46px' }}
        >
          Sign In to Store Console
        </button>
        {submitted && (
          <p
            id="adminMsg"
            style={{
              marginTop: '12px',
              fontSize: '0.84rem',
              color: 'var(--brand-blue)'
            }}
          >
            UI/UX Preview: Store administration backend will be connected in
            Phase 2.
          </p>
        )}
      </form>
    </div>
  );
}
