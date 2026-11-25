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
                <button
                  id="openAdminModalBtn"
                  onClick={() => openOverlay('admin')}
                >
                  Store administration
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 KUSHI DAIRY PRODUCTS. All rights reserved.</span>
          <button
            id="openCookieModalBtn"
            onClick={() => openOverlay('cookie')}
          >
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  );
}
