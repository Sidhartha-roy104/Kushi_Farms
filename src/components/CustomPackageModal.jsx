import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomer } from '../context/CustomerContext';
import { supabase } from '../lib/supabase';
import { normalizePhone, isValidPhone } from '../lib/phone';
import { openRazorpayCheckout } from '../lib/razorpay';
import { getPincodeDeliveryInfo, ACTIVE_PINCODES, RATE_PER_KM } from '../lib/pincodes';

const MULTIPLIERS = {
  daily: 30,
  twice_weekly: 8,
  monthly: 1,
  festival: 0
};

const FREQ_LABELS = {
  daily: 'Daily',
  twice_weekly: '2x / Week',
  monthly: 'Monthly',
  festival: 'Festival'
};

export default function CustomPackageModal({
  isOpen,
  onClose,
  selectedItems,
  dailySlot,
  twiceWeeklyDays,
  durationMonths = 1,
  festivals,
  onSaved
}) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { customer } = useCustomer();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer?.delivery_address) {
      setDeliveryArea((prev) => prev || customer.delivery_address);
      const pinMatch = String(customer.delivery_address).match(/\b(532\d{3})\b/);
      if (pinMatch) {
        setPincode((prev) => prev || pinMatch[1]);
      }
    }
  }, [customer?.delivery_address]);

  if (!isOpen) return null;

  const breakdown = selectedItems.map((item) => {
    const isMilkMonthly = item.id === 'cows-milk' && item.frequency === 'monthly';
    const monthlyMult = isMilkMonthly ? 30 : (MULTIPLIERS[item.frequency] ?? 1);
    const totalMult = monthlyMult * durationMonths;
    const lineTotal = item.price * item.qty * totalMult;
    return {
      ...item,
      multiplier: totalMult,
      lineTotal
    };
  });

  const hasTwiceWeekly = breakdown.some((item) => item.frequency === 'twice_weekly');
  const chosenSchedules = [
    ...new Set(breakdown.map((item) => FREQ_LABELS[item.frequency] || item.frequency))
  ].join(', ');

  const rawMonthlyTotal = breakdown.reduce((sum, i) => sum + i.lineTotal, 0);
  const finalMonthlyTotal = rawMonthlyTotal;
  const perDayApprox = Math.round(finalMonthlyTotal / (30 * durationMonths));

  const threshold = Number(settings.free_delivery_threshold ?? 199);
  const deliveryInfo = getPincodeDeliveryInfo(pincode, finalMonthlyTotal, threshold);
  const deliveryFee = deliveryInfo ? deliveryInfo.deliveryFee : 0;
  const grandTotal = finalMonthlyTotal + deliveryFee;

  const handlePayPackage = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = customerName.trim();
    const cleanPhone = normalizePhone(customerPhone);
    const cleanAddress = deliveryArea.trim();
    const cleanPincode = pincode.trim();

    if (!cleanName) {
      setError('Please enter your name.');
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
      setError('Please enter a valid 6-digit pincode (e.g., 532401).');
      return;
    }

    const info = getPincodeDeliveryInfo(cleanPincode, finalMonthlyTotal, threshold);
    if (!info) {
      setError(
        `Sorry, we currently deliver only to: ${ACTIVE_PINCODES.join(', ')}.`
      );
      return;
    }
    if (!info.meetsMinOrder) {
      setError(
        `Minimum order for ${info.area} (${info.distanceKm} km) is ₹${info.minOrderAmount}. Please add ${formatINR(info.shortfall)} more.`
      );
      return;
    }
    if (!supabase) {
      setError('Payment service is unavailable. Please confirm via WhatsApp.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: createData, error: createErr } =
        await supabase.functions.invoke('create-order', {
          body: {
            customPackage: {
              items: breakdown.map((item) => ({
                variantId: item.variantId,
                frequency: item.frequency,
                qty: item.qty
              })),
              durationMonths,
              dailySlot,
              twiceWeeklyDays,
              festivals
            },
            customer: {
              id: customer?.id || null,
              email: customer?.email || null,
              name: cleanName,
              phone: cleanPhone,
              address: cleanAddress,
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
        throw new Error(serverMsg || createErr?.message || 'Unable to place package order.');
      }

      // Save snapshot to custom_packages (non-blocking)
      try {
        const packageId = crypto.randomUUID();
        await supabase.from('custom_packages').insert({
          id: packageId,
          customer_id: customer?.id || null,
          customer_name: cleanName,
          customer_phone: cleanPhone,
          delivery_area: `${cleanAddress} (${cleanPincode})`,
          daily_slot: dailySlot,
          twice_weekly_days: twiceWeeklyDays,
          festivals,
          raw_monthly_total: rawMonthlyTotal,
          discount_percent: 0,
          discount_amount: 0,
          final_monthly_total: finalMonthlyTotal,
          status: 'confirmed'
        });
      } catch {
        // non-blocking
      }

      if (createData.payment_method === 'cod') {
        onSaved?.();
        onClose();
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
        throw new Error(
          verifyData?.error ||
            verifyErr?.message ||
            'Payment verification failed. Please contact support with your order reference.'
        );
      }

      onSaved?.();
      onClose();
      navigate(`/order-success?ref=${encodeURIComponent(verifyData.order_ref)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Checkout failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWhatsApp = async () => {
    setError('');
    const cleanName = customerName.trim();
    const cleanPhone = normalizePhone(customerPhone);
    const cleanArea = deliveryArea.trim();

    if (!cleanName || !isValidPhone(cleanPhone) || !cleanArea) {
      setError('Please enter your name, 10-digit mobile number, and delivery address.');
      return;
    }

    const lines = [
      'Hello Kushi Dairy (Chaparam, Srikakulam)!',
      'I would like to start my *Custom Kushi Package*:',
      ''
    ];

    breakdown.forEach((item, idx) => {
      const freqText = FREQ_LABELS[item.frequency];
      const priceNote =
        item.frequency === 'festival'
          ? '₹0 Advance (Pre-Order)'
          : `${formatINR(item.lineTotal)}/mo (${item.qty * item.multiplier} packs)`;
      lines.push(
        `${idx + 1}. ${item.name} (${item.variantLabel}) × ${item.qty} [${freqText}] — ${priceNote}`
      );
    });

    lines.push('');
    lines.push(`Daily Slot: ${dailySlot}`);
    lines.push(`Schedule: ${chosenSchedules}`);
    if (hasTwiceWeekly) {
      lines.push(`2x/Week Days: ${twiceWeeklyDays}`);
    }
    if (festivals.length > 0) {
      lines.push(`Festival Pre-Orders: ${festivals.join(', ')}`);
    }
    lines.push('');
    lines.push(
      `Estimated Package Total: ${formatINR(finalMonthlyTotal)} (~₹${perDayApprox}/day)`
    );
    lines.push('');
    lines.push(`Name: ${cleanName}`);
    lines.push(`Mobile: ${cleanPhone}`);
    lines.push(`Address: ${cleanArea} ${pincode ? `(${pincode})` : ''}`);

    const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onSaved?.();
    onClose();
  };

  return (
    <>
      <div className="overlay-backdrop open" onClick={onClose}></div>
      <div
        className="modal-dialog compact open custom-pkg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customPkgModalTitle"
      >
        <button
          className="modal-close-btn"
          aria-label="Close package checkout"
          onClick={onClose}
          disabled={submitting}
        >
          &times;
        </button>

        <span className="eyebrow">
          CUSTOM KUSHI PACKAGE · {durationMonths === 3 ? '3 MONTHS' : '1 MONTH'}
        </span>
        <h3
          id="customPkgModalTitle"
          style={{ fontSize: '1.4rem', marginBottom: '4px' }}
        >
          {durationMonths === 3 ? '3-Month Package Summary' : '1-Month Package Summary'}
        </h3>
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            marginBottom: '12px'
          }}
        >
          Slot: <strong>{dailySlot}</strong> · Schedule: <strong>{chosenSchedules}</strong>
          {hasTwiceWeekly && (
            <>
              {' '}· 2x/Week: <strong>{twiceWeeklyDays}</strong>
            </>
          )}
        </p>

        <div className="cpkg-modal-summary">
          {breakdown.map((item) => (
            <div className="cpkg-modal-row" key={item.id}>
              <div>
                <strong>
                  {item.name} ({item.variantLabel}) × {item.qty}
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {FREQ_LABELS[item.frequency]} · {formatINR(item.price)} ×{' '}
                  {item.qty * item.multiplier} packs
                </div>
              </div>
              <strong>
                {item.frequency === 'festival'
                  ? '₹0 Advance'
                  : formatINR(item.lineTotal)}
              </strong>
            </div>
          ))}

          <div className="cpkg-modal-totals">
            <div className="summary-row">
              <span>{durationMonths === 3 ? '3-Month Package Value' : 'Monthly Package Value'}</span>
              <span>{formatINR(rawMonthlyTotal)}</span>
            </div>
            <div className="summary-row">
              <span>
                {deliveryInfo
                  ? deliveryInfo.isFree
                    ? `Delivery (${deliveryInfo.area} · ${deliveryInfo.distanceKm} km, within 5 km)`
                    : `Delivery (${deliveryInfo.area} · ${deliveryInfo.distanceKm} km × ₹${RATE_PER_KM}/km)`
                  : `Delivery (Free ≥₹${threshold} within 5 km · else ₹${RATE_PER_KM}/km)`}
              </span>
              <span>
                {deliveryInfo ? (
                  deliveryInfo.isFree ? (
                    <strong style={{ color: 'var(--brand-green-dark)' }}>FREE</strong>
                  ) : (
                    formatINR(deliveryFee)
                  )
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className="summary-row total">
              <span>
                Total Payable{' '}
                <small style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                  (~₹{perDayApprox}/day)
                </small>
              </span>
              <span>{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {deliveryInfo && !deliveryInfo.meetsMinOrder && (
          <div className="checkout-error" role="alert">
            <strong>Minimum Order Required (₹{deliveryInfo.minOrderAmount})</strong>
            <p>
              For {deliveryInfo.area} ({deliveryInfo.distanceKm} km), minimum order
              is ₹{deliveryInfo.minOrderAmount}. Add {formatINR(deliveryInfo.shortfall)} more.
            </p>
          </div>
        )}

        {error && (
          <div className="checkout-error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handlePayPackage} noValidate>
          <div className="guest-inputs" style={{ marginBottom: '10px' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="cpkgName">Your Name *</label>
              <input
                type="text"
                id="cpkgName"
                placeholder="e.g., Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="cpkgPhone">Mobile Number *</label>
              <input
                type="tel"
                id="cpkgPhone"
                placeholder="10-digit mobile"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="guest-inputs" style={{ marginBottom: '10px' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="cpkgArea">House / Street Address *</label>
              <input
                type="text"
                id="cpkgArea"
                placeholder="Door no, street, village"
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="cpkgPincode">Pincode *</label>
              <input
                type="text"
                id="cpkgPincode"
                placeholder="e.g., 532401"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="payment-method-box" style={{ marginBottom: '12px' }}>
            <span className="payment-method-label">Payment Method</span>
            <div className="payment-method-options">
              <label className="payment-radio">
                <input
                  type="radio"
                  name="cpkgPayMethod"
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
                  name="cpkgPayMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  disabled={submitting}
                />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', height: '46px', marginBottom: '10px' }}
            disabled={
              submitting ||
              breakdown.length === 0 ||
              (deliveryInfo ? !deliveryInfo.meetsMinOrder : finalMonthlyTotal < 199)
            }
          >
            {submitting
              ? 'Processing...'
              : paymentMethod === 'cod'
                ? `Place COD Package · ${formatINR(grandTotal)}`
                : `Pay ${formatINR(grandTotal)} Now`}
          </button>
        </form>

        <button
          type="button"
          className="wa-confirm-btn"
          onClick={handleConfirmWhatsApp}
          disabled={submitting || breakdown.length === 0}
        >
          Confirm Package on WhatsApp
        </button>
      </div>
    </>
  );
}
