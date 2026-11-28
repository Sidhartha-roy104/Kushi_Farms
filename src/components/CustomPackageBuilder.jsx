import { useMemo, useState } from 'react';
import { useCart, formatINR } from '../context/CartContext';
import CustomPackageModal from './CustomPackageModal';

const FREQUENCIES = [
  { key: 'daily', label: 'Daily' },
  { key: 'twice_weekly', label: '2x / Week' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'festival', label: 'Festival' }
];

const DEFAULT_FREQ_BY_SLUG = {
  'cows-milk': 'daily',
  'frozen-paneer': 'twice_weekly',
  'fresh-curd': 'twice_weekly',
  mushroom: 'twice_weekly',
  'sweet-corn': 'twice_weekly',
  'green-peas': 'twice_weekly',
  honey: 'monthly',
  'pure-desi-ghee': 'monthly'
};

const DAILY_SLOTS = [
  'Morning (06:30–08:30 AM)',
  'Evening (05:30–07:30 PM)'
];

const TWICE_WEEKLY_DAYS = ['Wed & Sun', 'Tue & Sat', 'Mon & Thu'];

const FESTIVAL_OPTIONS = [
  'Sankranti',
  'Ugadi',
  'Vinayaka Chavithi',
  'Dasara',
  'Diwali',
  'Family Function'
];

export default function CustomPackageBuilder() {
  const { products, addPackageItemsToCart, openOverlay, showToast } = useCart();

  // Map: { [productId]: { vIdx: number, frequency: string, qty: number } }
  const [selections, setSelections] = useState({});
  const [dailySlot, setDailySlot] = useState(DAILY_SLOTS[0]);
  const [twiceWeeklyDays, setTwiceWeeklyDays] = useState(TWICE_WEEKLY_DAYS[0]);
  const [festivals, setFestivals] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const getProductConfig = (product) => {
    const existing = selections[product.id];
    if (existing) return existing;
    return {
      vIdx: 0,
      frequency: DEFAULT_FREQ_BY_SLUG[product.id] || 'daily',
      qty: 0
    };
  };

  const setVariant = (product, vIdx) => {
    setSelections((prev) => {
      const cur = prev[product.id] || getProductConfig(product);
      return { ...prev, [product.id]: { ...cur, vIdx } };
    });
  };

  const setFrequency = (product, frequency) => {
    setSelections((prev) => {
      const cur = prev[product.id] || getProductConfig(product);
      return { ...prev, [product.id]: { ...cur, frequency } };
    });
  };

  const changeQty = (product, delta) => {
    setSelections((prev) => {
      const cur = prev[product.id] || getProductConfig(product);
      const nextQty = Math.max(0, cur.qty + delta);
      return { ...prev, [product.id]: { ...cur, qty: nextQty } };
    });
  };

  const applyPopularMix = () => {
    const next = {};
    const findVariantIdx = (prod, preferredLabels) => {
      for (const lbl of preferredLabels) {
        const idx = prod.variants.findIndex(
          (v) => v.label.toLowerCase() === lbl.toLowerCase()
        );
        if (idx !== -1) return idx;
      }
      return 0;
    };

    const presetRules = {
      'cows-milk': { labels: ['500 ml', '200 ml'], frequency: 'daily', qty: 1 },
      'frozen-paneer': { labels: ['200 g'], frequency: 'twice_weekly', qty: 1 },
      'fresh-curd': { labels: ['450 g', '500 g', '180 g'], frequency: 'twice_weekly', qty: 1 },
      'pure-desi-ghee': { labels: ['250 g', '200 ml'], frequency: 'monthly', qty: 1 },
      honey: { labels: ['100 g'], frequency: 'monthly', qty: 1 }
    };

    products.forEach((p) => {
      const rule = presetRules[p.id];
      if (rule) {
        next[p.id] = {
          vIdx: findVariantIdx(p, rule.labels),
          frequency: rule.frequency,
          qty: rule.qty
        };
      }
    });

    setSelections(next);
    setFestivals(['Sankranti', 'Diwali']);
    showToast('Popular Family Mix applied');
  };

  const startEmpty = () => {
    setSelections({});
    setFestivals([]);
    showToast('Custom package cleared');
  };

  const toggleFestival = (fest) => {
    setFestivals((prev) =>
      prev.includes(fest) ? prev.filter((f) => f !== fest) : [...prev, fest]
    );
  };

  const selectedItems = useMemo(() => {
    return products
      .map((p) => {
        const cfg = selections[p.id];
        if (!cfg || cfg.qty <= 0) return null;
        const variant = p.variants[cfg.vIdx] || p.variants[0];
        if (!variant) return null;
        const freqObj = FREQUENCIES.find((f) => f.key === cfg.frequency);
        return {
          id: p.id,
          dbId: p.dbId,
          name: p.name,
          vIdx: cfg.vIdx,
          variantId: variant.id || null,
          variantLabel: variant.label,
          price: variant.price,
          image: p.image,
          fallback: p.fallback,
          frequency: cfg.frequency,
          schedule: freqObj ? freqObj.label : 'Daily',
          qty: cfg.qty
        };
      })
      .filter(Boolean);
  }, [products, selections]);

  const handleAddAllToCart = () => {
    if (selectedItems.length === 0) return;
    addPackageItemsToCart(selectedItems);
    setCheckoutOpen(false);
    openOverlay('cart');
  };

  return (
    <section className="section section-milk" id="custom-package">
      <div className="container">
        <div className="section-head" style={{ marginBottom: '18px' }}>
          <div>
            <span className="eyebrow">01 / BUILD YOUR OWN PACKAGE · SAVE 5%</span>
            <h2>
              Customize Your <span className="editorial-italic">Kushi Package.</span>
            </h2>
            <p>
              Pick any item, choose pack size &amp; schedule, and save 5% on your
              monthly pack.
            </p>
          </div>

          <div className="cpkg-presets">
            <button
              type="button"
              className="btn-outline cpkg-preset-btn"
              onClick={applyPopularMix}
            >
              ★ Popular Family Mix
            </button>
            <button
              type="button"
              className="btn-outline cpkg-preset-btn active"
              onClick={startEmpty}
            >
              Start Empty
            </button>
          </div>
        </div>

        <div className="cpkg-mobile-bar">
          <div className="cpkg-mobile-bar-info">
            <strong>
              {selectedItems.length === 0
                ? 'Tap + Add on items below'
                : `${selectedItems.length} ${
                    selectedItems.length === 1 ? 'item' : 'items'
                  } in pack`}
            </strong>
            <span>5% Bundle Off · Free Delivery</span>
          </div>
          <button
            type="button"
            className="btn-primary cpkg-mobile-bar-btn"
            disabled={selectedItems.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Checkout →
          </button>
        </div>

        <div className="cpkg-layout">
          {/* Left: Product Grid + Preferences */}
          <div>
            <div className="cpkg-grid">
              {products.map((product) => {
                const cfg = getProductConfig(product);
                const variant = product.variants[cfg.vIdx] || product.variants[0];
                const isSelected = cfg.qty > 0;
                const freqLabel =
                  FREQUENCIES.find((f) => f.key === cfg.frequency)?.label ||
                  'Daily';

                return (
                  <div
                    key={product.id}
                    className={`cpkg-card${isSelected ? ' selected' : ''}`}
                  >
                    <div className="cpkg-card-head">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="cpkg-thumb"
                        loading="lazy"
                        width="54"
                        height="54"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = product.fallback;
                        }}
                      />
                      <div className="cpkg-card-info">
                        <h3 className="cpkg-card-title">{product.name}</h3>
                        <span className="cpkg-card-sub">
                          {product.badge} · {product.category}
                        </span>
                      </div>
                      {variant && (
                        <span className="cpkg-unit-price">
                          {formatINR(variant.price)}
                        </span>
                      )}
                    </div>

                    <div className="cpkg-field">
                      <span className="cpkg-field-label">PACK SIZE</span>
                      <div className="variant-group" style={{ marginBottom: 0 }}>
                        {product.variants.map((v, i) => (
                          <button
                            key={v.label}
                            type="button"
                            className={`variant-pill${
                              i === cfg.vIdx ? ' active' : ''
                            }`}
                            onClick={() => setVariant(product, i)}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cpkg-field">
                      <span className="cpkg-field-label">DELIVERY SCHEDULE</span>
                      <div className="cpkg-freq-group">
                        {FREQUENCIES.map((freq) => (
                          <button
                            key={freq.key}
                            type="button"
                            className={`cpkg-freq-pill${
                              cfg.frequency === freq.key ? ' active' : ''
                            }`}
                            onClick={() => setFrequency(product, freq.key)}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cpkg-card-foot">
                      <span
                        className={`cpkg-status${isSelected ? ' active' : ''}`}
                      >
                        {isSelected
                          ? `✓ ${variant?.label} · ${freqLabel}`
                          : 'Optional · Tap + Add'}
                      </span>

                      {isSelected ? (
                        <div className="qty-stepper" style={{ height: '34px' }}>
                          <button
                            type="button"
                            className="qty-btn"
                            style={{ width: '26px', height: '26px' }}
                            aria-label={`Decrease ${product.name}`}
                            onClick={() => changeQty(product, -1)}
                          >
                            −
                          </button>
                          <span className="qty-count">{cfg.qty}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            style={{ width: '26px', height: '26px' }}
                            aria-label={`Increase ${product.name}`}
                            onClick={() => changeQty(product, 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="add-btn"
                          style={{ height: '34px', padding: '0 14px' }}
                          onClick={() => changeQty(product, 1)}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Preferences & Festival Pre-Order Strip */}
            <div className="cpkg-prefs-card">
              <div className="cpkg-prefs-row">
                <div>
                  <span className="cpkg-field-label">DAILY DELIVERY SLOT</span>
                  <div className="cpkg-freq-group">
                    {DAILY_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`cpkg-freq-pill${
                          dailySlot === slot ? ' active' : ''
                        }`}
                        onClick={() => setDailySlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="cpkg-field-label">2X / WEEK DAYS</span>
                  <div className="cpkg-freq-group">
                    {TWICE_WEEKLY_DAYS.map((days) => (
                      <button
                        key={days}
                        type="button"
                        className={`cpkg-freq-pill${
                          twiceWeeklyDays === days ? ' active' : ''
                        }`}
                        onClick={() => setTwiceWeeklyDays(days)}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <span className="cpkg-field-label">
                  FESTIVAL PRE-ORDERS (OPTIONAL)
                </span>
                <div className="cpkg-freq-group">
                  {FESTIVAL_OPTIONS.map((fest) => {
                    const active = festivals.includes(fest);
                    return (
                      <button
                        key={fest}
                        type="button"
                        className={`cpkg-fest-pill${active ? ' active' : ''}`}
                        onClick={() => toggleFestival(fest)}
                      >
                        {active ? `✓ ${fest}` : fest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky Package Summary (NO totals shown here) */}
          <aside className="cpkg-summary">
            <div className="cpkg-summary-head">
              <div>
                <h3>Your Custom Package</h3>
                <span>
                  {selectedItems.length}{' '}
                  {selectedItems.length === 1 ? 'product' : 'products'} selected
                  {festivals.length > 0
                    ? ` · ${festivals.length} festival${
                        festivals.length === 1 ? '' : 's'
                      }`
                    : ''}
                </span>
              </div>
              <span className="cpkg-bundle-badge">5% Bundle Off</span>
            </div>

            <div className="cpkg-summary-body">
              {selectedItems.length === 0 ? (
                <div className="cpkg-empty-msg">
                  <strong>Your package is empty</strong>
                  <p>
                    Tap <strong>+ Add</strong> on any product to build your own
                    Kushi schedule.
                  </p>
                </div>
              ) : (
                <div className="cpkg-summary-list">
                  {selectedItems.map((item) => (
                    <div className="cpkg-summary-item" key={item.id}>
                      <div>
                        <strong>
                          {item.name} × {item.qty}
                        </strong>
                        <span>
                          {item.variantLabel} · {formatINR(item.price)} each
                        </span>
                      </div>
                      <span className="cpkg-sched-chip">{item.schedule}</span>
                    </div>
                  ))}
                </div>
              )}

              {festivals.length > 0 && (
                <div className="cpkg-summary-fests">
                  <span className="cpkg-field-label" style={{ marginBottom: '4px' }}>
                    FESTIVAL PRE-ORDERS
                  </span>
                  <p>{festivals.join(', ')}</p>
                </div>
              )}

              <div className="cpkg-note-box">
                Total price &amp; 5% bundle savings will be calculated when you
                click <strong>Checkout</strong>.
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', height: '46px', marginBottom: '10px' }}
                disabled={selectedItems.length === 0}
                onClick={() => setCheckoutOpen(true)}
              >
                Proceed to Checkout →
              </button>

              <button
                type="button"
                className="btn-outline"
                style={{ width: '100%', height: '44px', fontSize: '0.84rem' }}
                disabled={selectedItems.length === 0}
                onClick={handleAddAllToCart}
              >
                {selectedItems.length > 0
                  ? `+ Add ${selectedItems.length} Selected to Regular Cart`
                  : '+ Add Package Items to Cart'}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <CustomPackageModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedItems={selectedItems}
        dailySlot={dailySlot}
        twiceWeeklyDays={twiceWeeklyDays}
        festivals={festivals}
        onAddToCartInstead={handleAddAllToCart}
        onSaved={() => showToast('Custom package confirmed on WhatsApp!')}
      />
    </section>
  );
}
