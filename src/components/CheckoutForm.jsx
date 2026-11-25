import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, formatINR } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { normalizePhone, isValidPhone } from '../lib/phone';
import { openRazorpayCheckout } from '../lib/razorpay';

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
  const deliveryFee =
    subtotal >= threshold ? 0 : Number(settings.delivery_fee ?? 20);
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
            paymentMethod: settings.cod_enabled ? paymentMethod : 'razorpay'
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

      {settings.cod_enabled && (
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
              <span>Pay Online (UPI / Card / NetBanking)</span>
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
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>
      )}

      <div className="checkout-totals">
        <div className="summary-row">
          <span>Items Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Local Delivery</span>
          <span>
            {deliveryFee === 0 ? (
              <strong style={{ color: 'var(--brand-green-dark)' }}>FREE</strong>
            ) : (
              formatINR(deliveryFee)
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
        disabled={submitting || items.length === 0}
      >
        {submitting
          ? 'Processing...'
          : error
            ? `Retry Payment · ${formatINR(grandTotal)}`
            : paymentMethod === 'cod' && settings.cod_enabled
              ? `Place COD Order · ${formatINR(grandTotal)}`
              : `Pay ${formatINR(grandTotal)} with Razorpay`}
      </button>
    </form>
  );
}
