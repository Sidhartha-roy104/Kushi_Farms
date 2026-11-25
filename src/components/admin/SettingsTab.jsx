import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSettings } from '../../context/SettingsContext';

export default function SettingsTab({ onNotify }) {
  const { settings, setSettings } = useSettings();
  const [deliveryFee, setDeliveryFee] = useState(String(settings.delivery_fee));
  const [threshold, setThreshold] = useState(
    String(settings.free_delivery_threshold)
  );
  const [storeOpen, setStoreOpen] = useState(settings.store_open);
  const [storeClose, setStoreClose] = useState(settings.store_close);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [pincodes, setPincodes] = useState(
    (settings.serviceable_pincodes || []).join(', ')
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDeliveryFee(String(settings.delivery_fee));
    setThreshold(String(settings.free_delivery_threshold));
    setStoreOpen(settings.store_open);
    setStoreClose(settings.store_close);
    setWhatsappNumber(settings.whatsapp_number);
    setPincodes((settings.serviceable_pincodes || []).join(', '));
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);

    const parsedPincodes = pincodes
      .split(',')
      .map((p) => p.trim())
      .filter((p) => /^[0-9]{6}$/.test(p));

    const payload = {
      delivery_fee: Number(deliveryFee) || 0,
      free_delivery_threshold: Number(threshold) || 0,
      store_open: storeOpen.trim(),
      store_close: storeClose.trim(),
      whatsapp_number: whatsappNumber.trim(),
      serviceable_pincodes: parsedPincodes,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('settings')
      .update(payload)
      .eq('id', 1)
      .select('*')
      .single();

    if (error) {
      onNotify?.(`Failed to save settings: ${error.message}`);
    } else if (data) {
      setSettings({
        ...settings,
        ...data,
        delivery_fee: Number(data.delivery_fee),
        free_delivery_threshold: Number(data.free_delivery_threshold)
      });
      onNotify?.('Store settings updated');
    }
    setSaving(false);
  };

  return (
    <div className="admin-panel">
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.2rem' }}>Store Settings</h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Configure delivery charges, free-delivery threshold, store hours,
          WhatsApp number, and serviceable pincodes.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-settings-grid">
          <div className="form-field">
            <label htmlFor="setDeliveryFee">Delivery Fee (₹)</label>
            <input
              type="number"
              id="setDeliveryFee"
              min="0"
              step="1"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="setThreshold">Free Delivery Threshold (₹)</label>
            <input
              type="number"
              id="setThreshold"
              min="0"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="setOpen">Store Opening Time</label>
            <input
              type="text"
              id="setOpen"
              placeholder="06:30 AM"
              value={storeOpen}
              onChange={(e) => setStoreOpen(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="setClose">Store Closing Time</label>
            <input
              type="text"
              id="setClose"
              placeholder="10:00 PM"
              value={storeClose}
              onChange={(e) => setStoreClose(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="setWa">WhatsApp Number (with country code)</label>
            <input
              type="text"
              id="setWa"
              placeholder="918464952708"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="setPins">
              Serviceable Pincodes (comma-separated 6-digit codes)
            </label>
            <textarea
              id="setPins"
              className="admin-textarea"
              rows={3}
              style={{ width: '100%' }}
              value={pincodes}
              onChange={(e) => setPincodes(e.target.value)}
              placeholder="532001, 532401, 532402"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ height: '44px', padding: '0 24px', marginTop: '8px' }}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Store Settings'}
        </button>
      </form>
    </div>
  );
}
