import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { openRazorpayCheckout } from '../lib/razorpay';
import { normalizePhone, isValidPhone } from '../lib/phone';
import { getPincodeDeliveryInfo, ACTIVE_PINCODES, RATE_PER_KM } from '../lib/pincodes';

const DAILY_SLOTS = [
  'Morning (06:30–08:30 AM)',
  'Evening (05:30–07:30 PM)'
];

function formatDateDisplay(date) {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

const SUBSCRIPTION_PLANS = {
  '1-month': {
    id: '1-month',
    eyebrow: '1-MONTH SUBSCRIPTION · SAVE ₹20',
    title: '1-Month Kushi Plan',
    subtitle: 'Complete monthly dairy & pantry essentials delivered fresh.',
    originalPrice: 2219,
    price: 2199,
    savings: 'Save ₹20',
    durationDays: 30,
    durationLabel: '1 Month (30 Days)',
    items: [
      {
        productId: 'cows-milk',
        name: "Cow's Milk",
        schedule: 'Daily',
        detail: '30 packs / month'
      },
      {
        productId: 'fresh-curd',
        name: 'Fresh Curd',
        schedule: '3x / Week',
        detail: '12 packs / month'
      },
      {
        productId: 'frozen-paneer',
        name: 'Frozen Paneer',
        schedule: '2x / Week',
        detail: '8 packs / month'
      },
      {
        productId: 'pure-desi-ghee',
        name: 'Pure Desi Ghee',
        schedule: '1x / Month',
        detail: '1 pack / month'
      },
      {
        productId: 'honey',
        name: 'Natural Honey',
        schedule: '1x / Month',
        detail: '1 pack / month'
      }
    ]
  },
  '3-month': {
    id: '3-month',
    eyebrow: '3-MONTH SUBSCRIPTION · SAVE ₹657',
    title: '3-Month Kushi Plan',
    subtitle: 'All 1-Month Plan essentials extended for 3 full months at max savings.',
    originalPrice: 6657,
    price: 5999,
    savings: 'Save ₹657',
    durationDays: 90,
    durationLabel: '3 Months (90 Days)',
    items: [
      {
        productId: 'cows-milk',
        name: "Cow's Milk",
        schedule: 'Daily',
        detail: '90 packs across 3 months'
      },
      {
        productId: 'fresh-curd',
        name: 'Fresh Curd',
        schedule: '3x / Week',
        detail: '36 packs across 3 months'
      },
      {
        productId: 'frozen-paneer',
        name: 'Frozen Paneer',
        schedule: '2x / Week',
        detail: '24 packs across 3 months'
      },
      {
        productId: 'pure-desi-ghee',
        name: 'Pure Desi Ghee',
        schedule: '1x / Month',
        detail: '3 packs across 3 months'
      },
      {
        productId: 'honey',
        name: 'Natural Honey',
        schedule: '1x / Month',
        detail: '3 packs across 3 months'
      }
    ]
  }
};

export default function TrustBar() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [activePlanKey, setActivePlanKey] = useState(null);
  const [modalStep, setModalStep] = useState('details'); // 'details' | 'checkout'
  const [dailySlot, setDailySlot] = useState(DAILY_SLOTS[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const activePlan = activePlanKey ? SUBSCRIPTION_PLANS[activePlanKey] : null;
  const threshold = Number(settings.free_delivery_threshold ?? 199);
  const deliveryInfo = activePlan
    ? getPincodeDeliveryInfo(pincode, activePlan.price, threshold)
    : null;
  const deliveryFee = deliveryInfo ? deliveryInfo.deliveryFee : 0;
  const grandTotal = activePlan ? activePlan.price + deliveryFee : 0;

  const startDate = new Date();
  const endDate = activePlan
    ? new Date(startDate.getTime() + activePlan.durationDays * 24 * 60 * 60 * 1000)
    : startDate;
  const startDateStr = formatDateDisplay(startDate);
  const endDateStr = formatDateDisplay(endDate);

  const openPlanModal = (key) => {
    setActivePlanKey(key);
    setModalStep('details');
    setError('');
  };

  const closePlanModal = () => {
    if (submitting) return;
    setActivePlanKey(null);
    setModalStep('details');
    setError('');
  };

  useEffect(() => {
    if (!activePlanKey) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) {
        setActivePlanKey(null);
        setModalStep('details');
        setError('');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [activePlanKey, submitting]);

  const handlePlanWhatsApp = () => {
    if (!activePlan) return;
    const lines = [
      'Hello Kushi Dairy (Chaparam, Srikakulam)!',
      `I would like to subscribe to the *${activePlan.title}* (${activePlan.durationLabel}):`,
      `Validity: ${startDateStr} to ${endDateStr}`,
      '',
      ...activePlan.items.map(
        (item, idx) => `${idx + 1}. ${item.name} — ${item.schedule} (${item.detail})`
      ),
      '',
      `Plan Price: ~${formatINR(activePlan.originalPrice)}~ *${formatINR(activePlan.price)}* (${activePlan.savings})`,
      'Please confirm my subscription & delivery slot.'
    ];
    const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    closePlanModal();
  };

  const handleRazorpaySubscription = async (e) => {
    e.preventDefault();
    if (!activePlan) return;
    setError('');

    const cleanName = name.trim();
    const cleanPhone = normalizePhone(phone);
    const cleanAddress = address.trim();
    const cleanLandmark = landmark.trim();
    const cleanPincode = pincode.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidPhone(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!cleanAddress) {
      setError('Please enter your house / street address.');
      return;
    }
    if (!/^[0-9]{6}$/.test(cleanPincode)) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }
    if (!getPincodeDeliveryInfo(cleanPincode)) {
      setError(
        `Sorry, we currently deliver only to: ${ACTIVE_PINCODES.join(', ')}.`
      );
      return;
    }
    if (!supabase) {
      setError('Payment service is not configured. Please order via WhatsApp.');
      return;
    }

    setSubmitting(true);

    try {
      const { data: createData, error: createErr } =
        await supabase.functions.invoke('create-order', {
          body: {
            subscriptionPlan: {
              planId: activePlan.id,
              dailySlot
            },
            customer: {
              name: cleanName,
              phone: cleanPhone,
              address: cleanAddress,
              landmark: cleanLandmark,
              pincode: cleanPincode
            },
            paymentMethod
          }
        });

      if (createErr || createData?.error) {
        let serverMsg = createData?.error;
        if (!serverMsg && createErr?.context && typeof createErr.context.json === 'function') {
          try {
            const errBody = await createErr.context.json();
            serverMsg = errBody?.error;
          } catch {
            // ignore
          }
        }
        throw new Error(serverMsg || createErr?.message || 'Unable to start subscription checkout.');
      }

      if (createData.payment_method === 'cod') {
        setActivePlanKey(null);
        setModalStep('details');
        navigate(
          `/order-success?ref=${encodeURIComponent(createData.order_ref)}&method=cod`
        );
        return;
      }

      const rzpResponse = await openRazorpayCheckout({
        keyId: createData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        orderId: createData.razorpay_order_id,
        amount: createData.amount,
        currency: createData.currency || 'INR',
        orderRef: createData.order_ref,
        customerName: cleanName,
        phone: cleanPhone
      });

      const { data: verifyData, error: verifyErr } =
        await supabase.functions.invoke('verify-payment', {
          body: {
            razorpay_order_id: rzpResponse.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_signature: rzpResponse.razorpay_signature
          }
        });

      if (verifyErr || verifyData?.error || !verifyData?.ok) {
        let serverMsg = verifyData?.error;
        if (!serverMsg && verifyErr?.context && typeof verifyErr.context.json === 'function') {
          try {
            const errBody = await verifyErr.context.json();
            serverMsg = errBody?.error;
          } catch {
            // ignore
          }
        }
        throw new Error(
          serverMsg ||
            verifyErr?.message ||
            'Payment verification failed. Contact us with your order reference.'
        );
      }

      setActivePlanKey(null);
      setModalStep('details');
      navigate(`/order-success?ref=${encodeURIComponent(verifyData.order_ref)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please retry.');
    } finally {
      setSubmitting(false);
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
            onClick={() => openPlanModal('1-month')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPlanModal('1-month');
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
            onClick={() => openPlanModal('3-month')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPlanModal('3-month');
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

      {activePlan &&
        createPortal(
          <>
            <div
              className="overlay-backdrop open"
              onClick={closePlanModal}
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
                onClick={closePlanModal}
                disabled={submitting}
              >
                &times;
              </button>

              {modalStep === 'details' ? (
                <>
                  <span className="eyebrow">{activePlan.eyebrow}</span>
                  <h3 id="planModalTitle" style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
                    {activePlan.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {activePlan.subtitle}
                  </p>

                  <div className="plan-modal-price-box">
                    <div>
                      <span className="plan-modal-duration">{activePlan.durationLabel}</span>
                      <div className="plan-modal-price-row">
                        <s>{formatINR(activePlan.originalPrice)}</s>
                        <strong>{formatINR(activePlan.price)}</strong>
                      </div>
                    </div>
                    <span className="plan-modal-save-pill">{activePlan.savings}</span>
                  </div>

                  <div className="plan-validity-box">
                    <strong>
                      Plan Validity: {startDateStr} → {endDateStr}
                    </strong>
                    <span>
                      Starts from your date of purchase and runs for {activePlan.durationDays} days.
                      Pay once upfront — after {endDateStr}, simply re-subscribe anytime to continue (no auto-debit).
                    </span>
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
                      onClick={() => setModalStep('checkout')}
                    >
                      Subscribe &amp; Pay {formatINR(activePlan.price)} →
                    </button>
                    <button
                      type="button"
                      className="wa-confirm-btn"
                      onClick={handlePlanWhatsApp}
                    >
                      Order on WhatsApp
                    </button>
                  </div>
                </>
              ) : (
                <form className="checkout-form" onSubmit={handleRazorpaySubscription} noValidate>
                  <div className="checkout-back-row">
                    <button
                      type="button"
                      className="checkout-back-btn"
                      onClick={() => {
                        setError('');
                        setModalStep('details');
                      }}
                      disabled={submitting}
                    >
                      ← Back to Plan Details
                    </button>
                    <span className="checkout-step-tag">{activePlan.durationLabel}</span>
                  </div>

                  <div className="plan-checkout-summary-bar">
                    <div>
                      <strong>{activePlan.title}</strong>
                      <span>Valid: {startDateStr} – {endDateStr}</span>
                    </div>
                    <strong className="plan-checkout-total">{formatINR(activePlan.price)}</strong>
                  </div>

                  {error && (
                    <div className="checkout-error" role="alert">
                      <strong>Checkout Issue</strong>
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="form-field">
                    <label>Preferred Daily Delivery Slot</label>
                    <div className="cpkg-freq-group">
                      {DAILY_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`cpkg-freq-pill${dailySlot === slot ? ' active' : ''}`}
                          onClick={() => setDailySlot(slot)}
                          disabled={submitting}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="subName">Full Name *</label>
                    <input
                      type="text"
                      id="subName"
                      placeholder="e.g., Srinivas Rao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="subPhone">10-Digit Mobile Number *</label>
                    <input
                      type="tel"
                      id="subPhone"
                      placeholder="e.g., 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="subAddress">House / Street Address *</label>
                    <input
                      type="text"
                      id="subAddress"
                      placeholder="Door no, street, village / colony"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="guest-inputs" style={{ marginBottom: '10px' }}>
                    <div className="form-field" style={{ marginBottom: 0 }}>
                      <label htmlFor="subLandmark">Landmark</label>
                      <input
                        type="text"
                        id="subLandmark"
                        placeholder="Near temple / school"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                    <div className="form-field" style={{ marginBottom: 0 }}>
                      <label htmlFor="subPincode">Pincode *</label>
                      <input
                        type="text"
                        id="subPincode"
                        placeholder="e.g., 532401"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="payment-method-box">
                    <span className="payment-method-label">Payment Method</span>
                    <div className="payment-method-options">
                      <label className="payment-radio">
                        <input
                          type="radio"
                          name="subPaymentMethod"
                          value="razorpay"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          disabled={submitting}
                        />
                        <span>Pay Online (PhonePe / GPay / UPI / Card)</span>
                      </label>
                      <label className="payment-radio">
                        <input
                          type="radio"
                          name="subPaymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          disabled={submitting}
                        />
                        <span>Cash on Delivery (COD)</span>
                      </label>
                    </div>
                  </div>

                  <div className="checkout-totals" style={{ margin: '6px 0 12px', paddingTop: '10px' }}>
                    <div className="summary-row">
                      <span>{activePlan.title}</span>
                      <span>{formatINR(activePlan.price)}</span>
                    </div>
                    <div className="summary-row">
                      <span>
                        {deliveryInfo
                          ? deliveryInfo.isFree
                            ? `Delivery (${deliveryInfo.area} · ${deliveryInfo.distanceKm} km, within 5 km)`
                            : `Delivery (${deliveryInfo.area} · ${deliveryInfo.distanceKm} km × ₹${RATE_PER_KM}/km · >5 km radius)`
                          : pincode.length === 6
                            ? 'Delivery (Outside service area)'
                            : `Delivery (Free within 5 km · ₹${RATE_PER_KM}/km beyond 5 km)`}
                      </span>
                      <span>
                        {deliveryInfo ? (
                          deliveryInfo.isFree ? (
                            <strong style={{ color: 'var(--brand-green-dark)' }}>FREE</strong>
                          ) : (
                            formatINR(deliveryFee)
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Payable</span>
                      <span>{formatINR(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', height: '48px' }}
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Processing...'
                      : paymentMethod === 'cod'
                        ? `Place COD Order · ${formatINR(grandTotal)}`
                        : `Pay ${formatINR(grandTotal)} Now`}
                  </button>
                </form>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
