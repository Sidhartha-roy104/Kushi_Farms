import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

const SUBSCRIPTION_PLANS = {
  '1-month': {
    id: '1-month',
    eyebrow: '1-MONTH SUBSCRIPTION · SAVE ₹20',
    title: '1-Month Kushi Plan',
    subtitle: 'Complete monthly dairy & pantry essentials delivered fresh.',
    originalPrice: '₹2,219',
    discountedPrice: '₹2,199',
    savings: 'Save ₹20',
    durationLabel: '30 Days',
    items: [
      {
        productId: 'cows-milk',
        name: "Cow's Milk",
        schedule: 'Daily',
        detail: '30 packs / month',
        qty: 1
      },
      {
        productId: 'fresh-curd',
        name: 'Fresh Curd',
        schedule: '3x / Week',
        detail: '12 packs / month',
        qty: 1
      },
      {
        productId: 'frozen-paneer',
        name: 'Frozen Paneer',
        schedule: '2x / Week',
        detail: '8 packs / month',
        qty: 1
      },
      {
        productId: 'pure-desi-ghee',
        name: 'Pure Desi Ghee',
        schedule: '1x / Month',
        detail: '1 pack / month',
        qty: 1
      },
      {
        productId: 'honey',
        name: 'Natural Honey',
        schedule: '1x / Month',
        detail: '1 pack / month',
        qty: 1
      }
    ]
  },
  '3-month': {
    id: '3-month',
    eyebrow: '3-MONTH SUBSCRIPTION · SAVE ₹657',
    title: '3-Month Kushi Plan',
    subtitle: 'All 1-Month Plan essentials extended for 3 full months at max savings.',
    originalPrice: '₹6,657',
    discountedPrice: '₹5,999',
    savings: 'Save ₹657',
    durationLabel: '90 Days (3 Months)',
    items: [
      {
        productId: 'cows-milk',
        name: "Cow's Milk",
        schedule: 'Daily',
        detail: '90 packs across 3 months',
        qty: 1
      },
      {
        productId: 'fresh-curd',
        name: 'Fresh Curd',
        schedule: '3x / Week',
        detail: '36 packs across 3 months',
        qty: 1
      },
      {
        productId: 'frozen-paneer',
        name: 'Frozen Paneer',
        schedule: '2x / Week',
        detail: '24 packs across 3 months',
        qty: 1
      },
      {
        productId: 'pure-desi-ghee',
        name: 'Pure Desi Ghee',
        schedule: '1x / Month',
        detail: '3 packs across 3 months',
        qty: 1
      },
      {
        productId: 'honey',
        name: 'Natural Honey',
        schedule: '1x / Month',
        detail: '3 packs across 3 months',
        qty: 1
      }
    ]
  }
};

export default function TrustBar() {
  const { products, addPackageItemsToCart, openOverlay, showToast } = useCart();
  const { settings } = useSettings();
  const [activePlanKey, setActivePlanKey] = useState(null);

  const activePlan = activePlanKey ? SUBSCRIPTION_PLANS[activePlanKey] : null;

  const handlePlanWhatsApp = () => {
    if (!activePlan) return;
    const lines = [
      'Hello Kushi Dairy (Chaparam, Srikakulam)!',
      `I would like to subscribe to the *${activePlan.title}* (${activePlan.durationLabel}):`,
      '',
      ...activePlan.items.map(
        (item, idx) => `${idx + 1}. ${item.name} — ${item.schedule} (${item.detail})`
      ),
      '',
      `Plan Price: ~${activePlan.originalPrice}~ *${activePlan.discountedPrice}* (${activePlan.savings})`,
      'Please confirm my subscription & delivery slot.'
    ];
    const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setActivePlanKey(null);
  };

  const handlePlanCheckout = () => {
    if (!activePlan) return;
    const packageItems = activePlan.items
      .map((planItem) => {
        const prod = products.find((p) => p.id === planItem.productId);
        if (!prod || !prod.variants?.length) return null;
        const variant = prod.variants[0];
        return {
          id: prod.id,
          vIdx: 0,
          variantId: variant.id || null,
          name: prod.name,
          variantLabel: variant.label,
          price: variant.price,
          image: prod.image,
          fallback: prod.fallback,
          schedule: `${activePlan.id === '1-month' ? '1-Mo' : '3-Mo'} Plan · ${planItem.schedule}`,
          qty: planItem.qty
        };
      })
      .filter(Boolean);

    if (packageItems.length > 0) {
      addPackageItemsToCart(packageItems);
      setActivePlanKey(null);
      openOverlay('cart');
    } else {
      showToast('Products are still loading. Please try again in a moment.');
    }
  };

  return (
    <>
      <div className="trust-bar-wrap">
        <div className="trust-bar">
          <div
            className="trust-item plan-card plan-one"
            role="button"
            tabIndex={0}
            onClick={() => setActivePlanKey('1-month')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePlanKey('1-month');
              }
            }}
          >
            <span className="trust-icon blue">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="3"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M9 16l2 2 4-4"></path>
              </svg>
            </span>
            <div>
              <strong>1-Month Plan</strong>
              <div className="trust-plan-price">
                <s className="trust-strike">₹2,219</s>
                <span className="trust-price">₹2,199</span>
              </div>
              <span className="trust-save">Save ₹20 · Tap for items</span>
            </div>
          </div>

          <div
            className="trust-item plan-card plan-three"
            role="button"
            tabIndex={0}
            onClick={() => setActivePlanKey('3-month')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePlanKey('3-month');
              }
            }}
          >
            <span className="trust-icon gold">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 7l4.5 4.5L12 4l5.5 7.5L22 7l-2 11H4L2 7z"></path>
                <line x1="5" y1="21" x2="19" y2="21"></line>
              </svg>
            </span>
            <div>
              <strong>3-Month Plan</strong>
              <div className="trust-plan-price">
                <s className="trust-strike">₹6,657</s>
                <span className="trust-price">₹5,999</span>
              </div>
              <span className="trust-save">Save ₹657 · Tap for items</span>
            </div>
          </div>

          <div className="trust-item">
            <span className="trust-icon blue">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </span>
            <div>
              <strong>On-Time Delivery</strong>
              <span>Fresh at your doorstep</span>
            </div>
          </div>

          <div className="trust-item">
            <span className="trust-icon green">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </span>
            <div>
              <strong>Supporting Local Farmers</strong>
              <span>Chaparam, Srikakulam</span>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-explore-wrap">
        <span className="scroll-line" aria-hidden="true"></span>
        <a href="#products" className="scroll-explore-link">
          <span>Scroll to explore</span>
          <span className="scroll-arrow-circle" aria-hidden="true">
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </span>
        </a>
        <span className="scroll-line" aria-hidden="true"></span>
      </div>

      {activePlan && (
        <>
          <div
            className="overlay-backdrop open"
            onClick={() => setActivePlanKey(null)}
          ></div>
          <div
            className="modal-dialog compact open plan-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="planModalTitle"
          >
            <button
              className="modal-close-btn"
              aria-label="Close plan details"
              onClick={() => setActivePlanKey(null)}
            >
              &times;
            </button>

            <span className="eyebrow">{activePlan.eyebrow}</span>
            <h3 id="planModalTitle" style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              {activePlan.title}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {activePlan.subtitle}
            </p>

            <div className="plan-modal-price-box">
              <div>
                <span className="plan-modal-duration">{activePlan.durationLabel}</span>
                <div className="plan-modal-price-row">
                  <s>{activePlan.originalPrice}</s>
                  <strong>{activePlan.discountedPrice}</strong>
                </div>
              </div>
              <span className="plan-modal-save-pill">{activePlan.savings}</span>
            </div>

            <div className="plan-modal-items">
              <span className="plan-modal-items-head">Included in this plan:</span>
              {activePlan.items.map((item) => (
                <div key={item.productId} className="plan-modal-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <span className="plan-modal-freq-pill">{item.schedule}</span>
                </div>
              ))}
            </div>

            <div className="plan-modal-actions">
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', height: '46px' }}
                onClick={handlePlanCheckout}
              >
                Proceed to Checkout →
              </button>
              <button
                type="button"
                className="wa-confirm-btn"
                onClick={handlePlanWhatsApp}
              >
                Order on WhatsApp
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
