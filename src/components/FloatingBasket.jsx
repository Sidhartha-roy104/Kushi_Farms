import { useCart, formatINR } from '../context/CartContext';

export default function FloatingBasket() {
  const { cartSummary, openOverlay } = useCart();
  const { count, total } = cartSummary;

  return (
    <div
      className={`floating-basket${count > 0 ? ' visible' : ''}`}
      id="floatingBasket"
      role="region"
      aria-label="Basket summary"
    >
      <span id="floatingBasketText">
        {count} {count === 1 ? 'item' : 'items'} · {formatINR(total)}
      </span>
      <button
        className="floating-basket-btn"
        id="floatingBasketBtn"
        onClick={() => openOverlay('cart')}
      >
        View Cart →
      </button>
    </div>
  );
}
