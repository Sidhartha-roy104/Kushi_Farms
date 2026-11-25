import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { PRODUCTS, FREE_DELIVERY_THRESHOLD } from '../data/products';

const CartContext = createContext(null);

export function formatINR(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

export function getCartKey(id, vIdx) {
  return `${id}__${vIdx}`;
}

export function CartProvider({ children }) {
  const [category, setCategory] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedVariants, setSelectedVariants] = useState(() =>
    Object.fromEntries(PRODUCTS.map((p) => [p.id, 0]))
  );
  const [cart, setCart] = useState({});
  const [activeOverlay, setActiveOverlay] = useState(null); // null | 'cart' | 'quickView' | 'story' | 'admin' | 'cookie'
  const [activeModalProductId, setActiveModalProductId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [cartPop, setCartPop] = useState(false);

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
      const product = PRODUCTS.find((p) => p.id === id);
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
    [showToast]
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
    return { count, total, threshold: FREE_DELIVERY_THRESHOLD };
  }, [cart]);

  const value = {
    products: PRODUCTS,
    category,
    setCategory,
    searchInput,
    setSearchInput,
    debouncedSearch,
    selectedVariants,
    selectVariant,
    cart,
    updateCart,
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
