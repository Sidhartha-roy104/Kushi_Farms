import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../data/products';

export default function Footer() {
  const { openOverlay } = useCart();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#home" className="brand-logo" aria-label="Kushi Dairy">
              <Logo variant="light" width={160} height={42} />
            </a>
            <p className="footer-tagline">
              Everyday essentials.
              <br />A little closer to home.
            </p>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li>
                <a href="#about">About us</a>
              </li>
              <li>
                <a href="#products">Our products</a>
              </li>
              <li>
                <a href="#contact">Contact us</a>
              </li>
              <li>
                <Link to="/track">Track order</Link>
              </li>
              <li>
                <button
                  id="footerCartLink"
                  onClick={() => openOverlay('cart')}
                >
                  Your cart
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Visit us</h4>
            <ul>
              <li>
                Chaparam Village, Patrunivalasa Post, Srikakulam, Andhra
                Pradesh, India
              </li>
              <li>
                <strong>Open 06:30 AM–10:00 PM</strong>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>We’re here to help</h4>
            <ul>
              <li>
                <a href="tel:+918464952708">+91 8464952708</a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <Link to="/admin">Store administration</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 KUSHI DAIRY PRODUCTS. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/refund-policy">Refunds</Link>
            <Link to="/shipping-policy">Delivery</Link>
            <button
              id="openCookieModalBtn"
              onClick={() => openOverlay('cookie')}
            >
              Cookie settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
