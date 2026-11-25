import { useCart, formatINR, getCartKey } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { selectedVariants, selectVariant, cart, updateCart, openQuickView } =
    useCart();

  const vIdx = selectedVariants[product.id] || 0;
  const variant = product.variants[vIdx];
  const key = getCartKey(product.id, vIdx);
  const qty = cart[key] ? cart[key].qty : 0;

  return (
    <article className="product-card">
      <div
        className="product-photo-box"
        onClick={() => openQuickView(product.id)}
      >
        <img
          src={product.image}
          alt={`${product.name} — ${product.badge}`}
          loading="lazy"
          width="400"
          height="310"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = product.fallback;
          }}
        />

        <button
          className="qv-eye-btn"
          aria-label={`Quick view ${product.name}`}
          onClick={(e) => {
            e.stopPropagation();
            openQuickView(product.id);
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <svg
          className="product-photo-wave"
          viewBox="0 0 360 32"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,18 C95,36 220,-4 360,20 L360,32 L0,32 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      <div className="product-body">
        <span className="product-brand-line">{product.brandLine}</span>
        <div className="product-title-row">
          <h3 className="product-title">{product.name}</h3>
          <span className="purity-pill">{product.purity}</span>
        </div>

        <div
          className="variant-group"
          role="group"
          aria-label={`Select size for ${product.name}`}
        >
          {product.variants.map((v, i) => (
            <button
              key={v.label}
              className={`variant-pill${i === vIdx ? ' active' : ''}`}
              aria-pressed={i === vIdx}
              onClick={() => selectVariant(product.id, i)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          className="details-link-btn"
          onClick={() => openQuickView(product.id)}
        >
          Choose size &amp; view details →
        </button>

        <div className="product-footer">
          <div className="price-block">
            <span className="price-value">{formatINR(variant.price)}</span>
            <span className="price-size">{variant.label}</span>
          </div>

          {qty > 0 ? (
            <div
              className="qty-stepper"
              aria-label={`Quantity for ${product.name}`}
            >
              <button
                className="qty-btn"
                aria-label="Decrease quantity"
                onClick={() => updateCart(product.id, vIdx, -1)}
              >
                −
              </button>
              <span className="qty-count">{qty}</span>
              <button
                className="qty-btn"
                aria-label="Increase quantity"
                onClick={() => updateCart(product.id, vIdx, 1)}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="add-btn"
              onClick={() => updateCart(product.id, vIdx, 1)}
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
