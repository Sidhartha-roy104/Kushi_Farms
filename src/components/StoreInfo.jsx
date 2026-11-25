import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function StoreInfo() {
  const { openOverlay } = useCart();
  const { settings } = useSettings();

  return (
    <section className="section section-milk section-compact" id="about">
      <div className="container">
        <div className="store-hub contact-hub-split">
          <div className="contact-hub-copy">
            <span className="eyebrow" style={{ marginBottom: '8px' }}>
              CHAPARAM · SRIKAKULAM
            </span>
            <h2>
              Contact <span className="editorial-italic">Kushi Dairy</span>
            </h2>
            <p className="contact-hub-lead">
              Fresh cow’s milk, homestyle curd, pure desi ghee, paneer, and
              everyday essentials straight from our Chaparam farm.
            </p>

            <div className="contact-meta-list">
              <div className="contact-meta-item">
                <span className="store-tile-icon">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
                <div>
                  <strong>
                    {settings.store_open} – {settings.store_close}
                  </strong>
                  <span>Open all 7 days for local delivery &amp; enquiries</span>
                </div>
              </div>

              <div className="contact-meta-item">
                <span className="store-tile-icon">
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <div>
                  <strong>Chaparam Village, Patrunivalasa Post</strong>
                  <span>
                    Srikakulam, Andhra Pradesh ·{' '}
                    <a
                      href="https://maps.google.com/?q=Chaparam+Village,+Patrunivalasa+Post,+Srikakulam,+Andhra+Pradesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-tile-link"
                      style={{ display: 'inline', marginTop: 0 }}
                    >
                      Google Maps ↗
                    </a>
                  </span>
                </div>
              </div>
            </div>

            <div className="contact-hub-actions">
              <a
                href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20Kushi%20Dairy!%20I%20have%20a%20question%20about%20your%20products.`}
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
              <a href={`tel:+91${settings.phone}`} className="btn-primary">
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
                Call {settings.phone}
              </a>
              <button
                className="story-text-btn"
                id="openStoryModalBtn"
                onClick={() => openOverlay('story')}
              >
                Read our story →
              </button>
            </div>
          </div>

          <div className="contact-hub-visual">
            <img
              src="/kushi-farm-banner.webp"
              alt="Kushi Dairy Products — Fresh milk, curd, ghee, paneer, and honey from our Chaparam farm"
              loading="lazy"
              width="640"
              height="478"
            />
            <div className="contact-visual-badge">
              <img
                src="/logo.webp"
                alt="Kushi Dairy"
                className="contact-visual-logo"
              />
              <div className="contact-visual-text">
                <strong>Simple Goodness. Every Day.</strong>
                <span>100% Pure · Farm Fresh from Chaparam</span>
              </div>
            </div>

            <div className="contact-visual-signature" aria-hidden="true">
              <div className="contact-visual-sig-text">
                <span>Purely Yours</span>
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
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <svg width="92" height="12" viewBox="0 0 110 14" fill="none">
                <path
                  d="M4 11C34 4 74 3 106 8"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
