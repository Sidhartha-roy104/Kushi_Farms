import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../context/CartContext';

const STATUS_LABELS = {
  placed: 'Placed',
  accepted: 'Accepted',
  on_the_way: 'On the way',
  delivered: 'Delivered'
};

export default function OrdersTab({ onNotify }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      setOrders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Live updates via Supabase Realtime when a new order arrives or updates
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            onNotify?.(`New order received: ${payload.new.order_ref}`);
            const { data } = await supabase
              .from('orders')
              .select('*, order_items(*)')
              .eq('id', payload.new.id)
              .maybeSingle();
            if (data) {
              setOrders((prev) => [
                data,
                ...prev.filter((o) => o.id !== data.id)
              ]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === payload.new.id ? { ...o, ...payload.new } : o
              )
            );
            setSelectedOrder((prev) =>
              prev && prev.id === payload.new.id
                ? { ...prev, ...payload.new }
                : prev
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNotify]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchQuery =
        !q ||
        (o.order_ref || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (orderId, nextStatus) => {
    if (!nextStatus || !supabase) return;
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId);

    if (error) {
      onNotify?.(`Failed to update status: ${error.message}`);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      setSelectedOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev
      );
      onNotify?.(`Order marked as ${STATUS_LABELS[nextStatus]}`);
    }
    setUpdatingId(null);
  };

  const handleGenerateInvoice = async (order) => {
    if (!supabase) return;
    setGeneratingId(order.id);
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-invoice',
        { body: { orderId: order.id } }
      );
      if (error || data?.error) {
        throw new Error(
          data?.error ||
            'Invoice generator Edge Function will be deployed in Phase 5.'
        );
      }
      if (data?.invoice_number) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, invoice_number: data.invoice_number }
              : o
          )
        );
        onNotify?.(`Invoice ${data.invoice_number} ready`);
      }
    } catch (err) {
      onNotify?.(
        err instanceof Error
          ? err.message
          : 'Invoice generation is wired in Phase 5.'
      );
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            type="search"
            className="admin-input"
            placeholder="Search order ref, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '250px' }}
          />
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter orders by status"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="on_the_way">On the way</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <button className="admin-btn-sm" onClick={loadOrders} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '28px' }}>
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: 'center',
                    padding: '28px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_ref}</strong>
                    {order.invoice_number && (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-tertiary)'
                        }}
                      >
                        {order.invoice_number}
                      </div>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    {new Date(order.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </td>
                  <td>
                    <strong>{order.customer_name}</strong>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {order.phone}
                    </div>
                  </td>
                  <td>{(order.order_items || []).length} items</td>
                  <td>
                    <strong>{formatINR(order.total)}</strong>
                  </td>
                  <td>
                    <span className={`status-pill ${order.payment_status}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${order.status}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      style={{ height: '34px', fontSize: '0.82rem' }}
                      value={
                        order.status === 'placed' ? '' : order.status
                      }
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      aria-label={`Change status for ${order.order_ref}`}
                    >
                      {order.status === 'placed' && (
                        <option value="" disabled>
                          Placed
                        </option>
                      )}
                      <option value="accepted">Accepted</option>
                      <option value="on_the_way">On the way</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="admin-btn-sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Details
                      </button>
                      <button
                        className="admin-btn-sm primary"
                        disabled={generatingId === order.id}
                        onClick={() => handleGenerateInvoice(order)}
                      >
                        {generatingId === order.id
                          ? 'Generating...'
                          : 'Generate Invoice'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <>
          <div
            className="overlay-backdrop open"
            onClick={() => setSelectedOrder(null)}
          ></div>
          <div
            className="modal-dialog compact open"
            role="dialog"
            aria-modal="true"
            aria-label={`Order details ${selectedOrder.order_ref}`}
            style={{ width: 'min(620px, 92vw)' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedOrder(null)}
              aria-label="Close order details"
            >
              &times;
            </button>
            <span className="eyebrow">ORDER DETAILS</span>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>
              {selectedOrder.order_ref}{' '}
              <span className={`status-pill ${selectedOrder.status}`}>
                {STATUS_LABELS[selectedOrder.status]}
              </span>
            </h3>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--bg-ice)',
                marginBottom: '16px',
                fontSize: '0.88rem'
              }}
            >
              <div>
                <strong>Customer:</strong> {selectedOrder.customer_name} (
                {selectedOrder.phone})
              </div>
              <div>
                <strong>Address:</strong> {selectedOrder.address?.street}
                {selectedOrder.address?.landmark
                  ? `, ${selectedOrder.address.landmark}`
                  : ''}{' '}
                — {selectedOrder.address?.pincode}
              </div>
              <div>
                <strong>Payment:</strong> {selectedOrder.payment_method} (
                {selectedOrder.payment_status})
              </div>
            </div>

            <table className="admin-table" style={{ marginBottom: '14px' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.order_items || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.variant_label}</td>
                    <td>{item.qty}</td>
                    <td>{formatINR(item.unit_price)}</td>
                    <td>{formatINR(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '10px',
                fontSize: '0.9rem'
              }}
            >
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatINR(selectedOrder.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>
                  {Number(selectedOrder.delivery_fee) === 0
                    ? 'FREE'
                    : formatINR(selectedOrder.delivery_fee)}
                </span>
              </div>
              <div className="summary-row total">
                <span>Grand Total</span>
                <span>{formatINR(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
