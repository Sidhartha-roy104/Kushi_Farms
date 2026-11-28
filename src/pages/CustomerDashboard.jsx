import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useCart, formatINR } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { openRazorpayCheckout } from '../lib/razorpay';
import { getPincodeDeliveryInfo, ACTIVE_PINCODES } from '../lib/pincodes';

function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getSubProgress(sub) {
  const totalDays = sub.duration_months === 3 ? 90 : 30;
  const startMs = new Date(sub.start_date).setHours(0, 0, 0, 0);
  const endMs = new Date(sub.end_date).setHours(0, 0, 0, 0);
  const todayMs = new Date().setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  const remainingDays = Math.max(0, Math.ceil((endMs - todayMs) / dayMs));
  const spanDays = Math.max(totalDays, Math.round((endMs - startMs) / dayMs));
  const elapsedDays = Math.min(spanDays, Math.max(0, spanDays - remainingDays));
  const pct = Math.min(100, Math.max(0, Math.round((elapsedDays / spanDays) * 100)));

  let statusKey = 'active';
  let statusLabel = 'Active';
  if (remainingDays <= 0) {
    statusKey = 'expired';
    statusLabel = 'Expired';
  } else if (remainingDays <= 5) {
    statusKey = 'expiring_soon';
    statusLabel = 'Expiring Soon';
  }

  return { remainingDays, elapsedDays, spanDays, pct, statusKey, statusLabel };
}

function extractPincode(text) {
  const match = String(text || '').match(/\b(532\d{3})\b/);
  return match ? match[1] : '532401';
}

export default function CustomerDashboard() {
  const { customer, isLoggedIn, logout, updateAddress } = useCustomer();
  const { products, cartSummary, addPackageItemsToCart, showToast } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'orders'
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const [expandedSubItems, setExpandedSubItems] = useState({});
  const [renewOpenId, setRenewOpenId] = useState(null);
  const [renewPhone, setRenewPhone] = useState('');
  const [renewName, setRenewName] = useState('');
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState('');

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/dashboard' } });
    }
  }, [isLoggedIn, navigate]);

  const loadDashboard = useCallback(async () => {
    if (!supabase || !customer?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_customer_dashboard', {
        p_customer_id: customer.id
      });
      if (!error && data) {
        setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      }
    } finally {
      setLoading(false);
    }
  }, [customer?.id]);

  useEffect(() => {
    if (customer?.id) {
      setAddressDraft(customer.delivery_address || '');
      loadDashboard();
    }
  }, [customer?.id, customer?.delivery_address, loadDashboard]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await updateAddress(addressDraft);
      setEditingAddress(false);
      showToast('Delivery address updated');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleRenewPlan = async (sub, planId) => {
    if (!supabase || !customer) return;
    setRenewError('');
    const cleanName = renewName.trim() || customer.email.split('@')[0];
    const cleanPhone = renewPhone.replace(/\D/g, '').slice(-10);
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setRenewError('Enter your 10-digit mobile number to confirm renewal.');
      return;
    }
    const pin = extractPincode(customer.delivery_address);
    const info = getPincodeDeliveryInfo(pin);
    if (!info) {
      setRenewError(
        `Update your saved address with a serviceable pincode (${ACTIVE_PINCODES.join(', ')}) first.`
      );
      return;
    }

    setRenewing(true);
    try {
      const { data: createData, error: createErr } =
        await supabase.functions.invoke('create-order', {
          body: {
            subscriptionPlan: {
              planId,
              dailySlot: 'Morning (06:30–08:30 AM)'
            },
            customer: {
              id: customer.id,
              email: customer.email,
              name: cleanName,
              phone: cleanPhone,
              address: customer.delivery_address,
              pincode: pin
            },
            paymentMethod: 'razorpay'
          }
        });

      if (createErr || createData?.error) {
        throw new Error(createData?.error || createErr?.message || 'Unable to initiate renewal.');
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
        throw new Error(verifyData?.error || verifyErr?.message || 'Payment verification failed.');
      }

      setRenewOpenId(null);
      showToast('Plan renewed! Confirmation sent to your email.');
      await loadDashboard();
    } catch (err) {
      setRenewError(err instanceof Error ? err.message : 'Renewal failed. Please retry.');
    } finally {
      setRenewing(false);
    }
  };

  const handleReorder = (order) => {
    const orderItems = order.order_items || [];
    const matched = [];

    orderItems.forEach((oi) => {
      const prod = products.find(
        (p) =>
          p.name.toLowerCase() === String(oi.product_name || '').toLowerCase() ||
          p.variants.some((v) => v.id === oi.variant_id)
      );
      if (!prod) return;
      let vIdx = prod.variants.findIndex(
        (v) =>
          v.id === oi.variant_id ||
          v.label.toLowerCase() === String(oi.variant_label || '').toLowerCase()
      );
      if (vIdx === -1) vIdx = 0;
      const variant = prod.variants[vIdx];
      matched.push({
        id: prod.id,
        vIdx,
        variantId: variant.id || null,
        name: prod.name,
        variantLabel: variant.label,
        price: variant.price,
        image: prod.image,
        fallback: prod.fallback,
        schedule: null,
        qty: oi.qty || 1
      });
    });

    if (matched.length === 0) {
      showToast('Items from this order are subscription plans or unavailable.');
      return;
    }

    addPackageItemsToCart(matched);
    navigate('/?openCart=1');
  };

  const activeSubCount = useMemo(
    () => subscriptions.length,
    [subscriptions]
  );

  if (!customer) return null;

  return (
    <div className="cust-page-shell">
      <header className="cust-topbar">
        <Link to="/" className="cust-topbar-back">
          ← Back to Store
        </Link>
        <span className="cust-topbar-title">My Dashboard</span>
        <Link to="/?openCart=1" className="cust-topbar-cart">
          Cart ({cartSummary.count})
        </Link>
      </header>

      <main className="cust-dash-main">
        {/* Compact Navy Profile Header Card */}
        <section className="cust-profile-card">
          <div className="cust-profile-top">
            <div>
              <span className="cust-profile-eyebrow">KUSHI DAIRY MEMBER</span>
              <h1 className="cust-profile-email">{customer.email}</h1>
            </div>
            <button
              type="button"
              className="cust-logout-btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </div>

          <div className="cust-address-row">
            {!editingAddress ? (
              <>
                <div className="cust-address-text">
                  <span>DELIVERY ADDRESS</span>
                  <p>{customer.delivery_address}</p>
                </div>
                <button
                  type="button"
                  className="cust-edit-btn"
                  onClick={() => setEditingAddress(true)}
                >
                  Edit
                </button>
              </>
            ) : (
              <form className="cust-address-edit-form" onSubmit={handleSaveAddress}>
                <input
                  type="text"
                  value={addressDraft}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  placeholder="House No, Street, Village/Colony, Pincode"
                  required
                  disabled={savingAddress}
                />
                <div className="cust-address-edit-actions">
                  <button
                    type="submit"
                    className="btn-green"
                    style={{ height: '38px', padding: '0 16px' }}
                    disabled={savingAddress}
                  >
                    {savingAddress ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="cust-edit-btn"
                    onClick={() => {
                      setEditingAddress(false);
                      setAddressDraft(customer.delivery_address || '');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* 2 Tabs */}
        <div className="cust-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'subscriptions'}
            className={`cust-tab-btn${activeTab === 'subscriptions' ? ' active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            My Subscriptions
            <span className="cust-tab-count">{activeSubCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'orders'}
            className={`cust-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
            <span className="cust-tab-count">{orders.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="cust-empty-card">
            <p>Loading your Kushi Dairy account...</p>
          </div>
        ) : activeTab === 'subscriptions' ? (
          <section className="cust-list-stack">
            {subscriptions.length === 0 ? (
              <div className="cust-empty-card">
                <strong>No active subscription plan yet</strong>
                <p>
                  Start a 1-Month (₹2,199) or 3-Month (₹5,999) plan or customize your own
                  monthly family schedule.
                </p>
                <Link to="/#custom-package" className="btn-primary" style={{ height: '44px' }}>
                  Build My Package →
                </Link>
              </div>
            ) : (
              subscriptions.map((sub) => {
                const prog = getSubProgress(sub);
                const subItems = Array.isArray(sub.items) ? sub.items : [];
                const isItemsOpen = Boolean(expandedSubItems[sub.id]);
                const isRenewOpen = renewOpenId === sub.id;

                return (
                  <article key={sub.id} className="cust-sub-card">
                    <div className="cust-sub-head">
                      <div>
                        <span className="cust-sub-duration">
                          {sub.duration_months === 3 ? '3-Month Plan · 90 Days' : '1-Month Plan · 30 Days'}
                        </span>
                        <h3>{sub.plan_name}</h3>
                      </div>
                      <span className={`cust-status-pill ${prog.statusKey}`}>
                        {prog.statusLabel}
                      </span>
                    </div>

                    <div className="cust-progress-wrap">
                      <div className="cust-progress-meta">
                        <strong>{prog.remainingDays} days remaining</strong>
                        <span>
                          {prog.elapsedDays} / {prog.spanDays} days
                        </span>
                      </div>
                      <div className="cust-progress-track">
                        <div
                          className={`cust-progress-fill ${prog.statusKey}`}
                          style={{ width: `${prog.pct}%` }}
                        />
                      </div>
                    </div>

                    {prog.statusKey === 'expiring_soon' && (
                      <p className="cust-expiry-alert">
                        Renewal reminder: Renew now so your morning delivery doesn’t pause.
                      </p>
                    )}

                    <div className="cust-dates-row">
                      <div>
                        <span>Start Date</span>
                        <strong>{formatShortDate(sub.start_date)}</strong>
                      </div>
                      <div>
                        <span>End Date</span>
                        <strong>{formatShortDate(sub.end_date)}</strong>
                      </div>
                      <div>
                        <span>Paid</span>
                        <strong>{formatINR(sub.amount_paid)}</strong>
                      </div>
                    </div>

                    <div className="cust-sub-actions">
                      <button
                        type="button"
                        className="cust-text-toggle"
                        onClick={() =>
                          setExpandedSubItems((prev) => ({
                            ...prev,
                            [sub.id]: !prev[sub.id]
                          }))
                        }
                      >
                        {isItemsOpen ? 'Hide Items ▴' : 'View Items ▾'}
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ height: '38px', padding: '0 14px', fontSize: '0.82rem' }}
                        onClick={() => {
                          setRenewOpenId(isRenewOpen ? null : sub.id);
                          setRenewError('');
                        }}
                      >
                        Renew / Extend →
                      </button>
                    </div>

                    {isItemsOpen && subItems.length > 0 && (
                      <div className="cust-sub-items">
                        {subItems.map((it, idx) => (
                          <div key={idx} className="cust-sub-item-row">
                            <span>{it.name}</span>
                            <strong>{it.schedule || it.detail}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {isRenewOpen && (
                      <div className="cust-renew-box">
                        {renewError && (
                          <div className="checkout-error" role="alert">
                            <p>{renewError}</p>
                          </div>
                        )}
                        <div className="guest-inputs" style={{ marginBottom: '10px' }}>
                          <div className="form-field" style={{ marginBottom: 0 }}>
                            <label htmlFor={`rName-${sub.id}`}>Your Name</label>
                            <input
                              type="text"
                              id={`rName-${sub.id}`}
                              placeholder="Name"
                              value={renewName}
                              onChange={(e) => setRenewName(e.target.value)}
                              disabled={renewing}
                            />
                          </div>
                          <div className="form-field" style={{ marginBottom: 0 }}>
                            <label htmlFor={`rPhone-${sub.id}`}>Mobile *</label>
                            <input
                              type="tel"
                              id={`rPhone-${sub.id}`}
                              placeholder="10-digit mobile"
                              value={renewPhone}
                              onChange={(e) => setRenewPhone(e.target.value)}
                              disabled={renewing}
                            />
                          </div>
                        </div>
                        <div className="cust-renew-btns">
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ height: '40px', fontSize: '0.82rem' }}
                            disabled={renewing}
                            onClick={() => handleRenewPlan(sub, '1-month')}
                          >
                            {renewing ? 'Processing...' : '+1 Month (₹2,199)'}
                          </button>
                          <button
                            type="button"
                            className="btn-green"
                            style={{ height: '40px', fontSize: '0.82rem' }}
                            disabled={renewing}
                            onClick={() => handleRenewPlan(sub, '3-month')}
                          >
                            {renewing ? 'Processing...' : '+3 Months · Save ₹657 (₹5,999)'}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </section>
        ) : (
          <section className="cust-list-stack">
            {orders.length === 0 ? (
              <div className="cust-empty-card">
                <strong>No orders placed with this account yet</strong>
                <p>Explore our fresh milk, curd, paneer, ghee, and honey.</p>
                <Link to="/#products" className="btn-primary" style={{ height: '44px' }}>
                  Browse Products →
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const orderItems = order.order_items || [];
                return (
                  <article key={order.id} className="cust-order-card">
                    <button
                      type="button"
                      className="cust-order-summary"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.id)
                      }
                    >
                      <div className="cust-order-left">
                        <strong>{order.order_ref}</strong>
                        <span>
                          {formatShortDate(order.created_at)} · {orderItems.length}{' '}
                          {orderItems.length === 1 ? 'item' : 'items'} ·{' '}
                          {order.payment_method === 'cod' ? 'COD' : 'Online'}
                        </span>
                      </div>
                      <div className="cust-order-right">
                        <strong>{formatINR(order.total)}</strong>
                        <span className={`cust-status-pill ${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="cust-order-details">
                        {orderItems.map((oi) => (
                          <div key={oi.id} className="cust-sub-item-row">
                            <span>
                              {oi.product_name} ({oi.variant_label}) × {oi.qty}
                            </span>
                            <strong>{formatINR(oi.line_total)}</strong>
                          </div>
                        ))}
                        <p className="cust-receipt-note">
                          ✉ Receipt sent to {order.customer_email || customer.email}
                        </p>
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ width: '100%', height: '40px', marginTop: '8px' }}
                          onClick={() => handleReorder(order)}
                        >
                          ↻ Reorder to Cart
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </section>
        )}
      </main>
    </div>
  );
}
