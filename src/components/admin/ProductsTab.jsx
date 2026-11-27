import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

function VariantRow({ variant, onSaved, onNotify }) {
  const [price, setPrice] = useState(String(variant.price));
  const [mrp, setMrp] = useState(variant.mrp !== null ? String(variant.mrp) : '');
  const [discount, setDiscount] = useState(String(variant.discount_percent ?? 0));
  const [stock, setStock] = useState(String(variant.stock ?? 0));
  const [isActive, setIsActive] = useState(Boolean(variant.is_active));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const numericStock = Number(stock);
  const isOut = numericStock <= 0;
  const isLow = numericStock > 0 && numericStock < 10;

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase
      .from('product_variants')
      .update({
        price: Number(price),
        mrp: mrp === '' ? null : Number(mrp),
        discount_percent: Number(discount) || 0,
        stock: Math.max(0, Math.floor(Number(stock) || 0)),
        is_active: isActive
      })
      .eq('id', variant.id);

    if (error) {
      onNotify?.(`Error saving ${variant.label}: ${error.message}`);
    } else {
      onNotify?.(`Saved ${variant.label}`);
      onSaved?.();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!supabase) return;
    if (!window.confirm(`Delete pack size "${variant.label}"? Past orders will not be affected.`)) {
      return;
    }
    setDeleting(true);
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variant.id);

    if (error) {
      onNotify?.(`Error deleting ${variant.label}: ${error.message}`);
    } else {
      onNotify?.(`Deleted ${variant.label}`);
      onSaved?.();
    }
    setDeleting(false);
  };

  return (
    <div className="admin-variant-row">
      <div>
        <label>Pack Size</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong>{variant.label}</strong>
          {isOut && <span className="status-pill out-stock">Out of stock</span>}
          {isLow && <span className="status-pill low-stock">Low stock ({numericStock})</span>}
        </div>
      </div>

      <div>
        <label>Price (₹)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="admin-input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <label>MRP (₹)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="admin-input"
          value={mrp}
          onChange={(e) => setMrp(e.target.value)}
        />
      </div>

      <div>
        <label>Disc %</label>
        <input
          type="number"
          min="0"
          max="100"
          className="admin-input"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
      </div>

      <div>
        <label>Stock</label>
        <input
          type="number"
          min="0"
          className="admin-input"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={
            isOut
              ? { borderColor: '#FCA5A5', background: '#FEF2F2' }
              : isLow
                ? { borderColor: '#FCD34D', background: '#FFFBEB' }
                : undefined
          }
        />
      </div>

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          className="admin-btn-sm primary"
          onClick={handleSave}
          disabled={saving || deleting}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="admin-btn-sm danger"
          onClick={handleDelete}
          disabled={saving || deleting}
          aria-label={`Delete ${variant.label}`}
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = {
  id: null,
  name: '',
  slug: '',
  category: 'Dairy',
  brand_line: 'KUSHI DAIRY · DAILY ESSENTIALS',
  badge: 'Fresh Daily',
  badge_tone: 'green',
  purity: '★ 4.9 · Pure',
  description: '',
  kitchen_tip: '',
  storage_tip: '',
  image_url: '',
  sort_order: 10,
  is_active: true,
  initialLabel: '',
  initialPrice: '',
  initialStock: '50'
};

export default function ProductsTab({ onNotify }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [uploading, setUploading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Add variant modal state
  const [variantProductId, setVariantProductId] = useState(null);
  const [newVarLabel, setNewVarLabel] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarStock, setNewVarStock] = useState('50');

  const loadProducts = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data)) {
      setProducts(
        data.map((p) => ({
          ...p,
          product_variants: (p.product_variants || []).sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
          )
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openAddProduct = () => {
    setForm({ ...EMPTY_PRODUCT, sort_order: products.length + 1 });
    setModalOpen(true);
  };

  const openEditProduct = (p) => {
    setForm({
      id: p.id,
      name: p.name || '',
      slug: p.slug || '',
      category: p.category || 'Dairy',
      brand_line: p.brand_line || 'KUSHI DAIRY · DAILY ESSENTIALS',
      badge: p.badge || 'Fresh Daily',
      badge_tone: p.badge_tone || 'green',
      purity: p.purity || '★ 4.9 · Pure',
      description: p.description || '',
      kitchen_tip: p.kitchen_tip || '',
      storage_tip: p.storage_tip || '',
      image_url: p.image_url || '',
      sort_order: p.sort_order ?? 0,
      is_active: Boolean(p.is_active)
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const safeSlug =
        (form.slug || form.name || 'product')
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-') +
        `-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('products')
        .upload(safeSlug, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: pubData } = supabase.storage
        .from('products')
        .getPublicUrl(safeSlug);

      setForm((prev) => ({ ...prev, image_url: pubData.publicUrl }));
      onNotify?.('Image uploaded to Storage');
    } catch (err) {
      onNotify?.(
        err instanceof Error ? err.message : 'Image upload failed'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSavingProduct(true);

    const baseSlug =
      form.slug.trim() ||
      form.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') ||
      `product-${Date.now()}`;

    const slugTaken =
      !form.id && products.some((p) => p.slug === baseSlug);
    const cleanSlug = slugTaken
      ? `${baseSlug}-${Date.now().toString().slice(-4)}`
      : baseSlug;

    const payload = {
      name: form.name.trim(),
      slug: cleanSlug,
      category: form.category,
      brand_line: form.brand_line.trim(),
      badge: form.badge.trim(),
      badge_tone: form.badge_tone,
      purity: form.purity.trim(),
      description: form.description.trim(),
      kitchen_tip: form.kitchen_tip.trim(),
      storage_tip: form.storage_tip.trim(),
      image_url: form.image_url.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active
    };

    if (form.id) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', form.id);

      if (error) {
        onNotify?.(`Error saving product: ${error.message}`);
      } else {
        onNotify?.('Product updated');
        setModalOpen(false);
        loadProducts();
      }
    } else {
      const { data: created, error } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single();

      if (error || !created) {
        onNotify?.(`Error adding product: ${error?.message || 'Insert failed'}`);
      } else {
        const priceNum = Number(form.initialPrice);
        const { error: varErr } = await supabase.from('product_variants').insert({
          product_id: created.id,
          label: form.initialLabel.trim() || '1 unit',
          price: priceNum,
          mrp: priceNum,
          discount_percent: 0,
          stock: Math.max(0, Math.floor(Number(form.initialStock) || 0)),
          is_active: true,
          sort_order: 1
        });
        if (varErr) {
          onNotify?.(`Product added, but variant failed: ${varErr.message}`);
        } else {
          onNotify?.('Product added');
        }
        setModalOpen(false);
        loadProducts();
      }
    }
    setSavingProduct(false);
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!supabase || !variantProductId) return;
    const { error } = await supabase.from('product_variants').insert({
      product_id: variantProductId,
      label: newVarLabel.trim(),
      price: Number(newVarPrice),
      mrp: Number(newVarPrice),
      discount_percent: 0,
      stock: Math.max(0, Math.floor(Number(newVarStock) || 0)),
      is_active: true,
      sort_order: 10
    });
    if (error) {
      onNotify?.(`Error adding variant: ${error.message}`);
    } else {
      onNotify?.('Variant added');
      setVariantProductId(null);
      setNewVarLabel('');
      setNewVarPrice('');
      setNewVarStock('50');
      loadProducts();
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!supabase) return;
    if (
      !window.confirm(
        `Delete "${product.name}" and all of its pack sizes? Past orders will keep their snapshot and will not be affected.`
      )
    ) {
      return;
    }
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      onNotify?.(`Error deleting ${product.name}: ${error.message}`);
    } else {
      onNotify?.(`Deleted ${product.name}`);
      loadProducts();
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <div>
          <h2 style={{ fontSize: '1.2rem' }}>Products &amp; Inventory</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Edit variant prices, MRP, discount, stock, and active status inline.
          </p>
        </div>
        <button className="btn-primary" style={{ height: '40px', padding: '0 18px', fontSize: '0.86rem' }} onClick={openAddProduct}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <p style={{ padding: '24px', textAlign: 'center' }}>Loading products...</p>
      ) : (
        products.map((product) => (
          <div className="admin-product-card" key={product.id}>
            <div className="admin-product-head">
              <div className="admin-product-meta">
                <img
                  className="admin-product-thumb"
                  src={product.image_url || product.fallback_url}
                  alt={product.name}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>{product.name}</strong>
                    {!product.is_active && (
                      <span className="status-pill failed">Hidden</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {product.category} · <code>{product.slug}</code>
                  </div>
                </div>
              </div>

              <div className="admin-product-actions">
                <button
                  className="admin-btn-sm"
                  onClick={() => setVariantProductId(product.id)}
                >
                  + Add Size
                </button>
                <button
                  className="admin-btn-sm"
                  onClick={() => openEditProduct(product)}
                >
                  Edit
                </button>
                <button
                  className="admin-btn-sm danger"
                  onClick={() => handleDeleteProduct(product)}
                >
                  Delete
                </button>
              </div>
            </div>

            {product.product_variants.map((v) => (
              <VariantRow
                key={v.id}
                variant={v}
                onSaved={loadProducts}
                onNotify={onNotify}
              />
            ))}
          </div>
        ))
      )}

      {modalOpen && (
        <>
          <div
            className="overlay-backdrop open"
            onClick={() => setModalOpen(false)}
          ></div>
          <div
            className="modal-dialog compact open"
            role="dialog"
            aria-modal="true"
            style={{ width: 'min(660px, 94vw)' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setModalOpen(false)}
              aria-label="Close product modal"
            >
              &times;
            </button>
            <span className="eyebrow">CATALOG ITEM</span>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>
              {form.id ? `Edit ${form.name}` : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div className="admin-form-grid">
                <div className="form-field">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Fresh Butter"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Category</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Farm Fresh">Farm Fresh</option>
                    <option value="Pantry">Pantry</option>
                  </select>
                </div>
              </div>

              {!form.id && (
                <div className="admin-form-grid admin-form-grid-3">
                  <div className="form-field">
                    <label>Pack Size *</label>
                    <input
                      type="text"
                      placeholder="e.g., 500 ml"
                      value={form.initialLabel}
                      onChange={(e) => setForm({ ...form, initialLabel: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 45"
                      value={form.initialPrice}
                      onChange={(e) => setForm({ ...form, initialPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Initial Stock *</label>
                    <input
                      type="number"
                      min="0"
                      value={form.initialStock}
                      onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="admin-form-grid">
                <div className="form-field">
                  <label>Badge</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Storage Tip</label>
                  <input
                    type="text"
                    placeholder="e.g., Keep refrigerated"
                    value={form.storage_tip}
                    onChange={(e) => setForm({ ...form, storage_tip: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Product Image (Upload to Storage or Paste URL)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <label className="admin-btn-sm" style={{ cursor: 'pointer' }}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  style={{ width: '100%' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Active on Storefront
                </label>

                <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 22px' }} disabled={savingProduct}>
                  {savingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {variantProductId && (
        <>
          <div
            className="overlay-backdrop open"
            onClick={() => setVariantProductId(null)}
          ></div>
          <div className="modal-dialog compact open" role="dialog" aria-modal="true">
            <button
              className="modal-close-btn"
              onClick={() => setVariantProductId(null)}
              aria-label="Close variant modal"
            >
              &times;
            </button>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '14px' }}>
              Add Pack Size Variant
            </h3>
            <form onSubmit={handleAddVariant}>
              <div className="form-field">
                <label>Size Label *</label>
                <input
                  type="text"
                  placeholder="e.g., 500 ml"
                  value={newVarLabel}
                  onChange={(e) => setNewVarLabel(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-grid">
                <div className="form-field">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={newVarStock}
                    onChange={(e) => setNewVarStock(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px' }}>
                Add Size Variant
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
