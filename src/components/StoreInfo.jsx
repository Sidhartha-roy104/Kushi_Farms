import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../data/products';

export default function StoreInfo() {
  const { openOverlay } = useCart();

  return (
    <section className="section section-milk section-compact" id="about">
      <div className="container">
        <div className="store-hub">
          <div className="store-hub-top">
            <div className="store-hub-heading">
              <span className="eyebrow" style={{ marginBottom: '6px' }}>
                CHAPARAM · SRIKAKULAM
              </span>
              <h2>Visit or Contact Kushi Dairy</h2>
              <p>
                Fresh milk, curd, ghee, paneer, and everyday essentials directly
                from our Chaparam counter.
              </p>
            </div>

            <div className="store-quick-actions">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Kushi%20Dairy!%20I%20have%20a%20question%20about%20your%20products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                WhatsApp Us
              </a>
              <a href="tel:+918464952708" className="btn-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Call 8464952708
              </a>
            </div>
          </div>

          <div className="store-info-grid">
            <div className="store-info-tile">
              <div className="store-tile-head">
                <span className="store-tile-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <span className="store-tile-label">Store Address</span>
              </div>
              <p className="store-tile-value">
                Chaparam Village, Patrunivalasa Post
              </p>
              <p className="store-tile-meta">
                Srikakulam, Andhra Pradesh, India
              </p>
              <a
                href="https://maps.google.com/?q=Chaparam+Village,+Patrunivalasa+Post,+Srikakulam,+Andhra+Pradesh"
                target="_blank"
                rel="noopener noreferrer"
                className="store-tile-link"
              >
                Open in Google Maps ↗
              </a>
            </div>

            <div className="store-info-tile">
              <div className="store-tile-head">
                <span className="store-tile-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
                <span className="store-tile-label">Store Hours</span>
              </div>
              <p className="store-tile-value">06:30 AM – 10:00 PM</p>
              <p className="store-tile-meta">
                Open all 7 days of the week for walk-in pickup and local orders.
              </p>
            </div>

            <div className="store-info-tile">
              <div className="store-tile-head">
                <span className="store-tile-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <span className="store-tile-label">Direct Contact</span>
              </div>
              <p className="store-tile-value">+91 8464952708</p>
              <p className="store-tile-meta">
                Call or message for stock updates, bulk orders, and delivery
                queries.
              </p>
              <a href="tel:+918464952708" className="store-tile-link">
                Tap to call directly →
              </a>
            </div>
          </div>

          <div className="store-hub-footer">
            <span>
              Walk-in counter &amp; neighbourhood delivery across Srikakulam.
            </span>
            <button
              className="story-text-btn"
              id="openStoryModalBtn"
              onClick={() => openOverlay('story')}
            >
              Read our story →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
