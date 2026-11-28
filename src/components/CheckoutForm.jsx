import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, formatINR } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { normalizePhone, isValidPhone } from '../lib/phone';
import { openRazorpayCheckout } from '../lib/razorpay';
import { getPincodeDeliveryInfo, ACTIVE_PINCODES, RATE_PER_KM } from '../lib/pincodes';

export default function CheckoutForm({ onBack }) {
  const { cart, cartSummary, clearCart, closeAllOverlays } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const items = Object.values(cart);
  const subtotal = cartSummary.total;
  const threshold = Number(settings.free_delivery_threshold ?? 199);
  const deliveryInfo = getPincodeDeliveryInfo(pincode, subtotal, threshold);
  const deliveryFee = deliveryInfo ? deliveryInfo.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase is not configured. Please check your environment.');
      return;
    }

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
      setError('Please enter your house/street delivery address.');
      return;
    }
    if (!/^[0-9]{6}$/.test(cleanPincode)) {
      setError('Please enter a valid 6-digit pincode (e.g., 532401).');
      return;
    }
    const info = getPincodeDeliveryInfo(cleanPincode, subtotal, threshold);
    if (!info) {
      setError(
        `Sorry, we currently deliver only to: ${ACTIVE_PINCODES.join(', ')}.`
      );
      return;
    }
    if (!info.meetsMinOrder) {
      setError(
        `Minimum order for ${info.area} (${info.distanceKm} km) is ₹${info.minOrderAmount}. Please add ${formatINR(info.shortfall)} more to place your order.`
      );
      return;
    }

    const missingVariantId = items.some((item) => !item.variantId);
    if (missingVariantId) {
      setError(
        'One or more items were added before live catalog sync. Please clear and re-add them.'
      );
      return;
    }

    setSubmitting(true);

    try {
      // 1. Server creates order & Razorpay order (recomputing prices/stock/delivery fee)
      const { data: createData, error: createErr } =
        await supabase.functions.invoke('create-order', {
          body: {
            cart: items.map((item) => ({
              variantId: item.variantId,
              qty: item.qty
            })),
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
            // ignore parse error
          }
        }
        throw new Error(
          serverMsg || createErr?.message || 'Unable to create order.'
        );
      }

      // COD flow (only active when settings.cod_enabled is true)
      if (createData.payment_method === 'cod') {
        clearCart();
        closeAllOverlays();
        navigate(
          `/order-success?ref=${encodeURIComponent(createData.order_ref)}&method=cod`
        );
        return;
      }

      // 2. Open Razorpay Checkout Popup
      const rzpResponse = await openRazorpayCheckout({
        keyId: createData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        orderId: createData.razorpay_order_id,
        amount: createData.amount,
        currency: createData.currency || 'INR',
        orderRef: createData.order_ref,
        customerName: cleanName,
        phone: cleanPhone
      });

      // 3. Verify signature & atomically decrement stock on server
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
            // ignore parse error
          }
        }
        throw new Error(
          serverMsg ||
            verifyErr?.message ||
            'Payment verification failed. If amount was deducted, contact us with your order reference.'
        );
      }

      clearCart();
      closeAllOverlays();
      navigate(
        `/order-success?ref=${encodeURIComponent(verifyData.order_ref)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <div className="checkout-back-row">
        <button
          type="button"
          className="checkout-back-btn"
          onClick={onBack}
          disabled={submitting}
        >
          ← Back to Cart
        </button>
        <span className="checkout-step-tag">Delivery Details</span>
      </div>

      {error && (
        <div className="checkout-error" role="alert">
          <strong>Payment / Order Issue</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="form-field">
        <label htmlFor="checkoutName">Full Name *</label>
        <input
          type="text"
          id="checkoutName"
          placeholder="e.g., Srinivas Rao"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="checkoutPhone">10-Digit Mobile Number *</label>
        <input
          type="tel"
          id="checkoutPhone"
          placeholder="e.g., 9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="checkoutAddress">House / Street Address *</label>
        <input
          type="text"
          id="checkoutAddress"
          placeholder="Door no, street, village / colony"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="guest-inputs" style={{ marginBottom: '12px' }}>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label htmlFor="checkoutLandmark">Landmark</label>
          <input
            type="text"
            id="checkoutLandmark"
            placeholder="Near temple / school"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label htmlFor="checkoutPincode">Pincode *</label>
          <input
            type="text"
            id="checkoutPincode"
            placeholder="e.g., 532401"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            required
            disabled={submitting}
          />
        </div>
      </div>

      {deliveryInfo && !deliveryInfo.meetsMinOrder && (
        <div className="checkout-error" role="alert">
          <strong>Minimum Order Required (₹{deliveryInfo.minOrderAmount})</strong>
          <p>
            For {deliveryInfo.area} ({deliveryInfo.distanceKm} km), minimum order
            is ₹{deliveryInfo.minOrderAmount}. Add {formatINR(deliveryInfo.shortfall)} more to continue.
          </p>
        </div>
      )}

      {!deliveryInfo && subtotal < 199 && (
        <div
          className="plan-validity-box"
          style={{ marginBottom: '12px', background: '#FFFBEB', borderColor: '#F59E0B' }}
        >
          <strong style={{ color: '#B45309' }}>Minimum Home Delivery Order</strong>
          <span>
            ₹199 minimum for 1–7 km radius · ₹399 minimum for 8–15 km radius.
          </span>
        </div>
      )}

      <div className="payment-method-box">
        <span className="payment-method-label">Payment Method</span>
        <div className="payment-method-options">
          <label className="payment-radio">
            <input
              type="radio"
              name="paymentMethod"
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
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              disabled={submitting}
            />
            <span>Cash on Delivery (COD)</span>
          </label>
        </div>
      </div>

      <div className="checkout-totals">
        <div className="summary-row">
          <span>Items Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>
            {deliveryInfo
              ? deliveryInfo.isFree
                ? `Delivery (${deliveryInfo.area} · ${deliveryInfo.distanceKm} km, within 5 km & ≥₹${threshold})`
                : deliveryInfo.isWithin5Km
                  ? `Delivery (${deliveryInfo.area} · ${deliveryInfo.distanceKm} km × ₹${RATE_PER_KM}/km · Free ≥₹${threshold})`
                  : `Delivery (${deliveryInfo.area} · ${deliveryInfo.distanceKm} km × ₹${RATE_PER_KM}/km · >5 km radius)`
              : pincode.length === 6
                ? 'Delivery (Outside service area)'
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
        disabled={
          submitting ||
          items.length === 0 ||
          (deliveryInfo ? !deliveryInfo.meetsMinOrder : subtotal < 199)
        }
      >
        {submitting
          ? 'Processing...'
          : error
            ? `Retry Order · ${formatINR(grandTotal)}`
            : paymentMethod === 'cod'
              ? `Place COD Order · ${formatINR(grandTotal)}`
              : `Pay ${formatINR(grandTotal)} Now`}
      </button>
    </form>
  );
}
