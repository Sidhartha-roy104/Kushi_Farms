import { useCart, formatINR, getCartKey } from '../context/CartContext';

export default function QuickViewModal() {
  const {
    products,
    activeOverlay,
    activeModalProductId,
    selectedVariants,
    selectVariant,
    cart,
    updateCart,
    closeAllOverlays
  } = useCart();

  const isOpen = activeOverlay === 'quickView' && activeModalProductId;
  const product = isOpen
    ? products.find((p) => p.id === activeModalProductId)
    : null;

  const vIdx = product ? selectedVariants[product.id] || 0 : 0;
  const variant = product ? product.variants[vIdx] : null;
  const key = product ? getCartKey(product.id, vIdx) : '';
  const qty = product && cart[key] ? cart[key].qty : 0;

  return (
    <div
      className={`modal-dialog${isOpen ? ' open' : ''}`}
      id="quickViewModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qvTitle"
    >
      <button
        className="modal-close-btn"
        aria-label="Close product details"
        onClick={closeAllOverlays}
      >
        &times;
      </button>
      <div className="qv-grid" id="quickViewBody">
        {product && variant && (
          <>
            <div className="qv-photo">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                width="400"
                height="400"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = product.fallback;
                }}
              />
              <svg
                className="qv-header-wave"
                viewBox="0 0 360 32"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,18 C110,36 230,-2 360,20 L360,32 L0,32 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>

            <div className="qv-content">
              <span
                className="product-brand-line"
                style={{ marginBottom: 0 }}
              >
                {product.brandLine}
              </span>
              <div className="product-title-row" style={{ marginBottom: 0 }}>
                <h3 id="qvTitle" style={{ fontSize: '1.55rem' }}>
                  {product.name}
                </h3>
                <span className="purity-pill">{product.purity}</span>
              </div>

              <div className="qv-pills">
                {(product.pills || []).map((pill, idx) => (
                  <span
                    key={pill}
                    className={`qv-pill${idx % 2 === 1 ? ' blue' : ''}`}
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <p
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65
                }}
              >
                {product.description}
              </p>

              <div className="qv-tip-box">
                <strong>Indian Kitchen Tip</strong>
                {product.kitchenTip}
              </div>

              <div
                className="qv-tip-box"
                style={{
                  background: 'var(--bg-ice)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <strong>Freshness &amp; Storage</strong>
                {product.freshness}
              </div>

              <div>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    letterSpacing: '0.05em'
                  }}
                >
                  CHOOSE PACK SIZE
                </span>
                <div className="variant-group" style={{ marginBottom: 0 }}>
                  {product.variants.map((v, i) => (
                    <button
                      key={v.label}
                      className={`variant-pill${i === vIdx ? ' active' : ''}`}
                      aria-pressed={i === vIdx}
                      onClick={() => selectVariant(product.id, i)}
                    >
                      {v.label} · {formatINR(v.price)}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 'auto'
                }}
              >
                <div className="price-block">
                  <span
                    className="price-value"
                    style={{ fontSize: '1.38rem' }}
                  >
                    {formatINR(variant.price)}
                  </span>
                  <span className="price-size">{variant.label}</span>
                </div>

                {product.isActive === false ? (
                  <button
                    type="button"
                    className="unavailable-btn"
                    style={{ height: '44px', padding: '0 20px' }}
                    disabled
                  >
                    Currently Not Available
                  </button>
                ) : qty > 0 ? (
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
                    className="btn-primary"
                    style={{ height: '44px', padding: '0 22px' }}
                    onClick={() => updateCart(product.id, vIdx, 1)}
                  >
                    + Add to Cart
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
