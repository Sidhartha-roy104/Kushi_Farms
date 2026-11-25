import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function CookieModal() {
  const { activeOverlay, closeAllOverlays, showToast } = useCart();
  const [prefChecked, setPrefChecked] = useState(true);
  const isOpen = activeOverlay === 'cookie';

  const handleSave = () => {
    closeAllOverlays();
    showToast('Cookie preferences saved');
  };

  return (
    <div
      className={`modal-dialog compact${isOpen ? ' open' : ''}`}
      id="cookieModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookieModalTitle"
    >
      <button
        className="modal-close-btn"
        aria-label="Close cookie settings"
        onClick={closeAllOverlays}
      >
        &times;
      </button>
      <span className="eyebrow">PRIVACY &amp; PREFERENCES</span>
      <h3
        id="cookieModalTitle"
        style={{ fontSize: '1.45rem', marginBottom: '8px' }}
      >
        Cookie Settings
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          marginBottom: '14px'
        }}
      >
        We keep browsing simple and respectful—no invasive tracking.
      </p>

      <div className="cookie-row">
        <div>
          <strong style={{ display: 'block', fontSize: '0.9rem' }}>
            Essential Cart Storage
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Remembers your guest basket items while browsing.
          </span>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--brand-green-dark)'
          }}
        >
          Always On
        </span>
      </div>

      <div
        className="cookie-row"
        style={{ borderBottom: 'none', marginBottom: '16px' }}
      >
        <div>
          <strong style={{ display: 'block', fontSize: '0.9rem' }}>
            Store Preferences
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Saves your preferred delivery area in Srikakulam.
          </span>
        </div>
        <input
          type="checkbox"
          id="prefCookieToggle"
          checked={prefChecked}
          onChange={(e) => setPrefChecked(e.target.checked)}
          style={{
            width: '18px',
            height: '18px',
            accentColor: 'var(--brand-blue)'
          }}
        />
      </div>

      <button
        className="btn-primary"
        id="saveCookiesBtn"
        style={{ width: '100%', height: '44px' }}
        onClick={handleSave}
      >
        Save Preferences
      </button>
    </div>
  );
}
