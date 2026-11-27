import { useState } from 'react';
import { formatINR } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { normalizePhone, isValidPhone } from '../lib/phone';

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
  festivals,
  onAddToCartInstead,
  onSaved
}) {
  const { settings } = useSettings();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const breakdown = selectedItems.map((item) => {
    const mult = MULTIPLIERS[item.frequency] ?? 1;
    const lineTotal = item.price * item.qty * mult;
    return {
      ...item,
      multiplier: mult,
      lineTotal
    };
  });

  const rawMonthlyTotal = breakdown.reduce((sum, i) => sum + i.lineTotal, 0);
  const discountAmount = Math.round(rawMonthlyTotal * 0.05);
  const finalMonthlyTotal = Math.max(0, rawMonthlyTotal - discountAmount);
  const perDayApprox = Math.round(finalMonthlyTotal / 30);

  const handleConfirmWhatsApp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = customerName.trim();
    const cleanPhone = normalizePhone(customerPhone);
    const cleanArea = deliveryArea.trim();

    if (!cleanName) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidPhone(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!cleanArea) {
      setError('Please enter your delivery area or pincode.');
      return;
    }

    setSubmitting(true);

    try {
      if (supabase) {
        const packageId = crypto.randomUUID();
        const { error: pkgErr } = await supabase.from('custom_packages').insert({
          id: packageId,
          customer_name: cleanName,
          customer_phone: cleanPhone,
          delivery_area: cleanArea,
          daily_slot: dailySlot,
          twice_weekly_days: twiceWeeklyDays,
          festivals,
          raw_monthly_total: rawMonthlyTotal,
          discount_percent: 5.0,
          discount_amount: discountAmount,
          final_monthly_total: finalMonthlyTotal,
          status: 'pending'
        });

        if (pkgErr) throw pkgErr;

        if (breakdown.length > 0) {
          const { error: itemsErr } = await supabase
            .from('custom_package_items')
            .insert(
              breakdown.map((item) => ({
                package_id: packageId,
                product_id: String(item.dbId || item.id),
                product_name: item.name,
                variant_label: item.variantLabel,
                unit_price: item.price,
                frequency: item.frequency,
                monthly_multiplier: item.multiplier,
                quantity: item.qty,
                line_total: item.lineTotal
              }))
            );

          if (itemsErr) throw itemsErr;
        }
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
            : `${formatINR(item.lineTotal)}/mo`;
        lines.push(
          `${idx + 1}. ${item.name} (${item.variantLabel}) × ${item.qty} [${freqText}] — ${priceNote}`
        );
      });

      lines.push('');
      lines.push(`Daily Slot: ${dailySlot}`);
      lines.push(`2x/Week Days: ${twiceWeeklyDays}`);
      if (festivals.length > 0) {
        lines.push(`Festival Pre-Orders: ${festivals.join(', ')}`);
      }
      lines.push('');
      lines.push(`Monthly Value: ${formatINR(rawMonthlyTotal)}`);
      lines.push(`5% Bundle Savings: -${formatINR(discountAmount)}`);
      lines.push(`Doorstep Delivery: FREE`);
      lines.push(
        `*Estimated Monthly Total: ${formatINR(finalMonthlyTotal)}* (~₹${perDayApprox}/day)`
      );
      lines.push('');
      lines.push(`Name: ${cleanName}`);
      lines.push(`Mobile: ${cleanPhone}`);
      lines.push(`Area / Pincode: ${cleanArea}`);

      const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
        lines.join('\n')
      )}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save package. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
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
        >
          &times;
        </button>

        <span className="eyebrow">CUSTOM KUSHI PACKAGE · 5% BUNDLE OFF</span>
        <h3
          id="customPkgModalTitle"
          style={{ fontSize: '1.45rem', marginBottom: '6px' }}
        >
          Monthly Package Summary
        </h3>
        <p
          style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            marginBottom: '14px'
          }}
        >
          Slot: <strong>{dailySlot}</strong> · 2x/Week:{' '}
          <strong>{twiceWeeklyDays}</strong>
        </p>

        <div className="cpkg-breakdown-box">
          {breakdown.map((item) => (
            <div
              className="cpkg-breakdown-row"
              key={`${item.id}_${item.frequency}`}
            >
              <div>
                <strong>
                  {item.name} ({item.variantLabel}) × {item.qty}
                </strong>
                <span>
                  {FREQ_LABELS[item.frequency]} ·{' '}
                  {item.frequency === 'festival'
                    ? '0 (₹0 Advance)'
                    : `${formatINR(item.price)} × ${item.multiplier}`}
                </span>
              </div>
              <strong>
                {item.frequency === 'festival'
                  ? '₹0.00'
                  : formatINR(item.lineTotal)}
              </strong>
            </div>
          ))}

          {festivals.length > 0 && (
            <div className="cpkg-fest-summary">
              <span>Festival Pre-Orders:</span>
              <strong>{festivals.join(', ')}</strong>
            </div>
          )}

          <div className="cpkg-totals-divider">
            <div className="summary-row">
              <span>Monthly Package Value</span>
              <span>{formatINR(rawMonthlyTotal)}</span>
            </div>
            <div className="summary-row" style={{ color: 'var(--brand-green-dark)' }}>
              <span>Custom Package Savings (5%)</span>
              <span>−{formatINR(discountAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Doorstep Delivery (Chaparam)</span>
              <strong style={{ color: 'var(--brand-green-dark)' }}>FREE</strong>
            </div>
            <div className="summary-row total">
              <span>
                Total Estimated Monthly{' '}
                <small style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                  (~₹{perDayApprox}/day)
                </small>
              </span>
              <span>{formatINR(finalMonthlyTotal)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="checkout-error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleConfirmWhatsApp}>
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

          <div className="form-field">
            <label htmlFor="cpkgArea">Area / Pincode *</label>
            <input
              type="text"
              id="cpkgArea"
              placeholder="e.g., Chaparam, 532401"
              value={deliveryArea}
              onChange={(e) => setDeliveryArea(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="wa-confirm-btn"
            style={{ marginBottom: '10px' }}
            disabled={submitting || breakdown.length === 0}
          >
            {submitting ? 'Saving Package...' : 'Confirm Package on WhatsApp'}
          </button>
        </form>

        <button
          type="button"
          className="btn-outline"
          style={{ width: '100%', height: '44px' }}
          onClick={onAddToCartInstead}
          disabled={submitting || breakdown.length === 0}
        >
          + Add Items to Cart Instead
        </button>
      </div>
    </>
  );
}
