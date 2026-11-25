import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../data/products';

export default function Navbar() {
  const { searchInput, setSearchInput, cartSummary, cartPop, openOverlay } =
    useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className={`navbar-wrap${scrolled ? ' scrolled' : ''}`} id="navbarWrap">
        <header className="navbar-pill">
          <a href="#home" className="brand-logo" aria-label="Kushi Dairy Home">
            <Logo variant="dark" width={148} height={40} />
          </a>

          <nav aria-label="Main Navigation">
            <ul className="nav-links">
              <li>
                <a href="#home" className="nav-link active">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="nav-link">
                  Our Products
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#essentials" className="nav-link">
                  Goodness
                </a>
              </li>
              <li>
                <a href="#about" className="nav-link">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="nav-link">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="nav-right">
            <div className="nav-search">
              <svg
                className="nav-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                id="navSearchInput"
                placeholder="Search for products..."
                aria-label="Search for products"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Kushi%20Dairy!%20I%20would%20like%20to%20enquire%20about%20your%20products.`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-circle-btn"
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>

            <button
              className="nav-cart-btn"
              id="openCartBtn"
              aria-label="Open your cart"
              onClick={() => openOverlay('cart')}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span
                className={`cart-badge${cartPop ? ' pop' : ''}`}
                id="navCartCount"
              >
                {cartSummary.count}
              </span>
            </button>

            <button
              className="mobile-menu-btn"
              id="mobileMenuBtn"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="7" x2="21" y2="7"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="17" x2="21" y2="17"></line>
              </svg>
            </button>
          </div>
        </header>
      </div>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`} id="mobileNav">
        <a href="#home" onClick={() => setMobileOpen(false)}>
          Home
        </a>
        <a href="#products" onClick={() => setMobileOpen(false)}>
          Our Products
        </a>
        <a href="#essentials" onClick={() => setMobileOpen(false)}>
          Goodness
        </a>
        <a href="#about" onClick={() => setMobileOpen(false)}>
          About Us &amp; Store Hours
        </a>
        <a href="#contact" onClick={() => setMobileOpen(false)}>
          Contact &amp; Delivery Area
        </a>
      </div>
    </>
  );
}
