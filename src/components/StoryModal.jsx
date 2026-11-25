import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../data/products';

export default function StoryModal() {
  const { activeOverlay, closeAllOverlays } = useCart();
  const isOpen = activeOverlay === 'story';

  return (
    <div
      className={`modal-dialog compact${isOpen ? ' open' : ''}`}
      id="storyModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="storyModalTitle"
    >
      <button
        className="modal-close-btn"
        aria-label="Close story modal"
        onClick={closeAllOverlays}
      >
        &times;
      </button>
      <span className="eyebrow">CHAPARAM · SRIKAKULAM</span>
      <h3
        id="storyModalTitle"
        style={{ fontSize: '1.65rem', marginBottom: '12px' }}
      >
        From Chaparam, with care.
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          marginBottom: '14px',
          lineHeight: 1.7
        }}
      >
        Kushi Dairy Products started with a simple neighbourhood promise in
        Chaparam Village, Patrunivalasa Post: bring clean, honest milk, curd,
        ghee, and everyday kitchen essentials directly to families across
        Srikakulam without unnecessary middlemen.
      </p>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          marginBottom: '20px',
          lineHeight: 1.7
        }}
      >
        We stay open from <strong>06:30 AM to 10:00 PM</strong> every day so
        whether you need morning cow&apos;s milk for filter coffee, midday curd,
        or evening paneer and sweet corn, a friendly voice is always just a
        WhatsApp message away.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
          style={{ height: '44px', padding: '0 20px', fontSize: '0.88rem' }}
        >
          Chat on WhatsApp
        </a>
        <button
          className="btn-outline"
          style={{ height: '44px', padding: '0 20px', fontSize: '0.88rem' }}
          onClick={closeAllOverlays}
        >
          Back to Store
        </button>
      </div>
    </div>
  );
}
