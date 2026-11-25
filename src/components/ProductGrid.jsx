import { useMemo, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const {
    products,
    loadingProducts,
    category,
    setCategory,
    searchInput,
    setSearchInput,
    debouncedSearch,
    resetFilters,
    showToast
  } = useCart();
  const { settings } = useSettings();

  const searchRef = useRef(null);

  const categories = [
    { value: 'all', label: `All (${products.length || 8})` },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Farm Fresh', label: 'Farm Fresh' },
    { value: 'Pantry', label: 'Pantry' }
  ];

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return products.filter((p) => {
      const catMatch = category === 'all' || p.category === category;
      const searchMatch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [products, category, debouncedSearch]);

  const handleClearSearch = () => {
    setSearchInput('');
    searchRef.current?.focus();
  };

  return (
    <section className="section section-ice" id="products">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">THE KUSHI COLLECTION</span>
            <h2>
              Goodness for <span className="editorial-italic">every table.</span>
            </h2>
            <p>
              Find your daily favourites, all in one place. Browse and order as
              a guest on WhatsApp.
            </p>
          </div>
          <button
            className="btn-outline"
            id="viewAllBtn"
            style={{ height: '44px', padding: '0 20px' }}
            onClick={() => {
              resetFilters();
              showToast(
                `Showing all ${products.length || 8} Kushi Dairy products`
              );
            }}
          >
            View all products
          </button>
        </div>

        <div className="brand-promise-bar">
          <span className="promise-pill">
            <span className="promise-check">✓</span> Chaparam Village Sourced
          </span>
          <span className="promise-pill">
            <span className="promise-check">✓</span> Daily Fresh Stock
          </span>
          <span className="promise-pill">
            <span className="promise-check">✓</span> Hygienically Sealed Packs
          </span>
          <span className="promise-pill">
            <span className="promise-check">✓</span> Free Local Delivery over ₹
            {settings.free_delivery_threshold}
          </span>
        </div>

        <div className="catalog-controls">
          <div
            className="filter-pills"
            role="tablist"
            aria-label="Filter products by category"
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`filter-pill${category === cat.value ? ' active' : ''}`}
                data-category={cat.value}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              ref={searchRef}
              type="search"
              id="catalogSearch"
              className="search-input"
              placeholder="Search milk, paneer, honey..."
              aria-label="Search Kushi Dairy products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              className={`search-clear${searchInput ? ' visible' : ''}`}
              id="searchClear"
              aria-label="Clear search"
              onClick={handleClearSearch}
            >
              &times;
            </button>
          </div>
        </div>

        <div className="products-grid" id="productsGrid">
          {loadingProducts ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                className="product-card skeleton-card"
                key={idx}
                aria-hidden="true"
              >
                <div className="product-photo-box skeleton-shimmer">
                  <svg
                    className="product-photo-wave"
                    viewBox="0 0 360 32"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,18 C95,36 220,-4 360,20 L360,32 L0,32 Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </div>
                <div className="product-body">
                  <div className="skeleton-line skeleton-shimmer sm"></div>
                  <div className="skeleton-line skeleton-shimmer lg"></div>
                  <div className="skeleton-pills">
                    <span className="skeleton-pill skeleton-shimmer"></span>
                    <span className="skeleton-pill skeleton-shimmer"></span>
                    <span className="skeleton-pill skeleton-shimmer"></span>
                  </div>
                  <div className="skeleton-footer">
                    <div className="skeleton-line skeleton-shimmer price"></div>
                    <div className="skeleton-pill skeleton-shimmer btn"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3 style={{ marginBottom: '8px' }}>
                No products found for &quot;{debouncedSearch}&quot;
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '16px'
                }}
              >
                Try searching for Cow&apos;s Milk, Paneer, Honey, Mushroom, Sweet
                Corn, or Green Peas.
              </p>
              <button
                className="btn-outline"
                id="resetCatalogBtn"
                style={{ height: '42px' }}
                onClick={resetFilters}
              >
                Show all {products.length || 8} products
              </button>
            </div>
          ) : (
            filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
