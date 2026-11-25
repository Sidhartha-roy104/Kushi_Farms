import { useMemo, useRef } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

const CATEGORIES = [
  { value: 'all', label: 'All (8)' },
  { value: 'Dairy', label: 'Dairy' },
  { value: 'Farm Fresh', label: 'Farm Fresh' },
  { value: 'Pantry', label: 'Pantry' }
];

export default function ProductGrid() {
  const {
    products,
    category,
    setCategory,
    searchInput,
    setSearchInput,
    debouncedSearch,
    resetFilters,
    showToast
  } = useCart();

  const searchRef = useRef(null);

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
              showToast('Showing all 8 Kushi Dairy products');
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
            <span className="promise-check">✓</span> Free Local Delivery over
            ₹199
          </span>
        </div>

        <div className="catalog-controls">
          <div
            className="filter-pills"
            role="tablist"
            aria-label="Filter products by category"
          >
            {CATEGORIES.map((cat) => (
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
          {filtered.length === 0 ? (
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
                Show all 8 products
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
