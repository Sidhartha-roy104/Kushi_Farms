import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { supabase } from '../lib/supabase';
import { useSettings } from './SettingsContext';

const CartContext = createContext(null);

export function formatINR(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

export function getCartKey(id, vIdx) {
  return `${id}__${vIdx}`;
}

function mapSupabaseProduct(row) {
  const activeVariants = (row.product_variants || [])
    .filter((v) => v.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((v) => ({
      id: v.id,
      label: v.label,
      price: Number(v.price),
      mrp: v.mrp !== null && v.mrp !== undefined ? Number(v.mrp) : null,
      discountPercent: v.discount_percent ?? 0,
      stock: v.stock ?? 0
    }));

  return {
    id: row.slug || row.id,
    dbId: row.id,
    slug: row.slug,
    name: row.name,
    brandLine: row.brand_line || 'KUSHI DAIRY · DAILY ESSENTIALS',
    purity: row.purity || '★ 4.9 · Pure',
    badge: row.badge || 'Fresh Daily',
    badgeTone: row.badge_tone || 'green',
    category: row.category,
    pills: Array.isArray(row.pills) ? row.pills : [],
    image: row.image_url,
    fallback:
      row.fallback_url ||
      `https://placehold.co/600x440/E5F0FF/1256A8?text=${encodeURIComponent(
        row.name
      )}`,
    description: row.description || '',
    kitchenTip: row.kitchen_tip || '',
    freshness: row.storage_tip || '',
    variants: activeVariants
  };
}

export function CartProvider({ children }) {
  const { settings } = useSettings();
  const [products, setProducts] = useState(
    supabase ? [] : FALLBACK_PRODUCTS
  );
  const [loadingProducts, setLoadingProducts] = useState(Boolean(supabase));
  const [category, setCategory] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedVariants, setSelectedVariants] = useState(() =>
    Object.fromEntries(FALLBACK_PRODUCTS.map((p) => [p.id, 0]))
  );
  const [cart, setCart] = useState({});
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [activeModalProductId, setActiveModalProductId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [cartPop, setCartPop] = useState(false);

  // Load active products & variants from Supabase
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (!supabase) {
        setProducts(FALLBACK_PRODUCTS);
        setLoadingProducts(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_variants(*)')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (cancelled) return;

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data
            .map(mapSupabaseProduct)
            .filter((p) => p.variants.length > 0);
          setProducts(mapped.length > 0 ? mapped : FALLBACK_PRODUCTS);
          setSelectedVariants((prev) => {
            const next = { ...prev };
            mapped.forEach((p) => {
              if (next[p.id] === undefined) next[p.id] = 0;
            });
            return next;
          });
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        if (!cancelled) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce search input for smooth filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Body scroll lock & Escape key handler for overlays
  useEffect(() => {
    document.body.style.overflow = activeOverlay ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeOverlay]);

  const closeAllOverlays = useCallback(() => {
    setActiveOverlay(null);
    setActiveModalProductId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAllOverlays();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAllOverlays]);

  const showToast = useCallback((text) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, text, fading: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, fading: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 250);
    }, 2100);
  }, []);

  const selectVariant = useCallback((productId, vIdx) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: vIdx
    }));
  }, []);

  const updateCart = useCallback(
    (id, vIdx, delta) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const variant = product.variants[vIdx];
      if (!variant) return;
      const key = getCartKey(id, vIdx);

      setCart((prev) => {
        const existing = prev[key];
        const nextQty = (existing ? existing.qty : 0) + delta;

        if (nextQty <= 0) {
          const next = { ...prev };
          delete next[key];
          return next;
        }

        if (delta > 0 && !existing) {
          showToast(`Added ${product.name} (${variant.label})`);
        }

        return {
          ...prev,
          [key]: {
            id,
            vIdx,
            variantId: variant.id || null,
            name: product.name,
            variantLabel: variant.label,
            price: variant.price,
            image: product.image,
            fallback: product.fallback,
            qty: nextQty
          }
        };
      });

      setCartPop(true);
      setTimeout(() => setCartPop(false), 240);
    },
    [products, showToast]
  );

  const openQuickView = useCallback((productId) => {
    setActiveModalProductId(productId);
    setActiveOverlay('quickView');
  }, []);

  const openOverlay = useCallback((name) => {
    setActiveModalProductId(null);
    setActiveOverlay(name);
  }, []);

  const resetFilters = useCallback(() => {
    setCategory('all');
    setSearchInput('');
    setDebouncedSearch('');
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const selectRange = useCallback((rangeQuery) => {
    setCategory('all');
    setSearchInput(rangeQuery);
    setDebouncedSearch(rangeQuery);
  }, []);

  const cartSummary = useMemo(() => {
    let count = 0;
    let total = 0;
    Object.values(cart).forEach((item) => {
      count += item.qty;
      total += item.price * item.qty;
    });
    return {
      count,
      total,
      threshold: Number(settings.free_delivery_threshold ?? 199)
    };
  }, [cart, settings.free_delivery_threshold]);

  const value = {
    products,
    loadingProducts,
    category,
    setCategory,
    searchInput,
    setSearchInput,
    debouncedSearch,
    selectedVariants,
    selectVariant,
    cart,
    updateCart,
    clearCart,
    cartSummary,
    cartPop,
    activeOverlay,
    activeModalProductId,
    openQuickView,
    openOverlay,
    closeAllOverlays,
    resetFilters,
    selectRange,
    toasts,
    showToast
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
