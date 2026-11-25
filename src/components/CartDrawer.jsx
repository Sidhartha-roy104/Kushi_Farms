import { useState } from 'react';
import { useCart, formatINR } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../data/products';

export default function CartDrawer() {
  const { cart, cartSummary, updateCart, activeOverlay, closeAllOverlays } =
    useCart();
  const [guestName, setGuestName] = useState('');
  const [guestArea, setGuestArea] = useState('');

  const isOpen = activeOverlay === 'cart';
  const items = Object.values(cart);
  const { count, total, threshold } = cartSummary;
  const pct = Math.min(100, Math.round((total / threshold) * 100));
  const unlocked = total >= threshold;

  const handleConfirmWhatsApp = () => {
    if (items.length === 0) return;
    const name = guestName.trim();
    const area = guestArea.trim();

    const lines = [
      'Hello Kushi Dairy (Chaparam, Srikakulam)!',
      'I would like to confirm my order:',
      ''
    ];
    items.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. ${item.name} (${item.variantLabel}) x ${item.qty} = ${formatINR(item.price * item.qty)}`
      );
    });
    lines.push('');
    lines.push(`Total: ${formatINR(total)}`);
    if (name) lines.push(`Name: ${name}`);
    if (area) lines.push(`Delivery Area / Pincode: ${area}`);
    lines.push('');
    lines.push('Please confirm availability & delivery time.');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      className={`cart-drawer${isOpen ? ' open' : ''}`}
      id="cartDrawer"
      role="dialog"
      aria-modal="true"
      aria-label="Your Kushi Dairy Cart"
    >
      <div className="drawer-header">
        <h3>
          Your Cart
          <span className="drawer-badge-inline" id="drawerCartCount">
            {count}
          </span>
        </h3>
        <button
          className="nav-circle-btn"
          aria-label="Close cart"
          style={{ width: '36px', height: '36px', fontSize: '1.3rem' }}
          onClick={closeAllOverlays}
        >
          &times;
        </button>
      </div>

      <div className="delivery-progress">
        <div
          className={`delivery-progress-text${unlocked ? ' unlocked' : ''}`}
          id="deliveryProgressText"
        >
          {unlocked ? (
            <>
              <span>Free Local Delivery Unlocked!</span>
              <span>100%</span>
            </>
          ) : (
            <>
              <span>
                Add {formatINR(threshold - total)} for Free Local Delivery
              </span>
              <span>{pct}%</span>
            </>
          )}
        </div>
        <div className="delivery-bar-track">
          <div
            className="delivery-bar-fill"
            id="deliveryBarFill"
            style={{ width: `${pct}%` }}
          ></div>
        </div>
      </div>

      <div className="drawer-items" id="drawerItems">
        {items.length === 0 ? (
          <div className="cart-empty">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto' }}
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <strong>Your basket is empty</strong>
            <p style={{ fontSize: '0.86rem' }}>
              Add fresh milk, curd, ghee, paneer, or farm-fresh essentials to
              order on WhatsApp.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div className="cart-item" key={`${item.id}__${item.vIdx}`}>
              <img
                className="cart-item-img"
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = item.fallback;
                }}
              />
              <div className="cart-item-info">
                <strong>{item.name}</strong>
                <span>
                  {item.variantLabel} · {formatINR(item.price)} each
                </span>
                <div className="cart-item-price">
                  {formatINR(item.price * item.qty)}
                </div>
              </div>
              <div className="qty-stepper" style={{ height: '34px' }}>
                <button
                  className="qty-btn"
                  style={{ width: '26px', height: '26px' }}
                  aria-label="Decrease quantity"
                  onClick={() => updateCart(item.id, item.vIdx, -1)}
                >
                  −
                </button>
                <span className="qty-count">{item.qty}</span>
                <button
                  className="qty-btn"
                  style={{ width: '26px', height: '26px' }}
                  aria-label="Increase quantity"
                  onClick={() => updateCart(item.id, item.vIdx, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="drawer-footer">
        <div className="guest-inputs">
          <input
            type="text"
            id="guestName"
            className="guest-input"
            placeholder="Your name (optional)"
            aria-label="Your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
          <input
            type="text"
            id="guestArea"
            className="guest-input"
            placeholder="Area / Landmark"
            aria-label="Delivery area or landmark"
            value={guestArea}
            onChange={(e) => setGuestArea(e.target.value)}
          />
        </div>

        <div className="summary-row">
          <span>Guest Order Subtotal</span>
          <span id="drawerSubtotal">{formatINR(total)}</span>
        </div>
        <div className="summary-row total">
          <span>Total Payable</span>
          <span id="drawerTotal">{formatINR(total)}</span>
        </div>

        <button
          className="wa-confirm-btn"
          id="confirmWaBtn"
          disabled={count === 0}
          onClick={handleConfirmWhatsApp}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          Confirm Order on WhatsApp
        </button>
      </div>
    </aside>
  );
}
