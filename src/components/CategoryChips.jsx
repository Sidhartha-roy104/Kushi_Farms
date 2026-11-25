import { useCart } from '../context/CartContext';

const RANGES = [
  {
    range: 'Milk',
    label: 'Cow’s Milk',
    price: 'From ₹10',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2h8"></path>
        <path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"></path>
      </svg>
    )
  },
  {
    range: 'Curd',
    label: 'Fresh Curd',
    price: 'From ₹10',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 11h16a1 1 0 0 1 1 1v.5c0 4.5-3.5 8.5-9 8.5s-9-4-9-8.5V12a1 1 0 0 1 1-1z"></path>
        <path d="M7 11c0-2 2.2-3 5-3s5 1 5 3"></path>
      </svg>
    )
  },
  {
    range: 'Ghee',
    label: 'Desi Ghee',
    price: 'From ₹350',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 7h12v11a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V7z"></path>
        <path d="M8 7V4h8v3"></path>
      </svg>
    )
  },
  {
    range: 'Paneer',
    label: 'Paneer',
    price: 'From ₹95',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="7" height="7" rx="1.5"></rect>
        <rect x="13" y="4" width="7" height="7" rx="1.5"></rect>
        <rect x="4" y="13" width="7" height="7" rx="1.5"></rect>
        <rect x="13" y="13" width="7" height="7" rx="1.5"></rect>
      </svg>
    )
  },
  {
    range: 'Honey',
    label: 'Pure Honey',
    price: 'From ₹70',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
      </svg>
    )
  },
  {
    range: 'Mushroom',
    label: 'Farm Fresh',
    price: 'From ₹22',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3C7 3 3 7 3 11h18c0-4-4-8-9-8z"></path>
        <path d="M9 11v7a3 3 0 0 0 6 0v-7"></path>
      </svg>
    )
  }
];

export default function CategoryChips() {
  const { selectRange } = useCart();

  const handleClick = (range) => {
    selectRange(range);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section section-white section-compact" id="essentials">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">01 / EVERYDAY GOODNESS</span>
            <h2>Shop by Daily Range</h2>
            <p>
              Six trusted kitchen essentials, available fresh every day from
              Chaparam.
            </p>
          </div>
          <a
            href="#products"
            className="btn-outline"
            style={{ height: '42px', padding: '0 20px', fontSize: '0.86rem' }}
          >
            Explore All 8 Products →
          </a>
        </div>

        <div className="range-grid">
          {RANGES.map((item) => (
            <button
              key={item.range}
              className="range-chip"
              data-range={item.range}
              onClick={() => handleClick(item.range)}
            >
              <span className="range-icon">{item.icon}</span>
              <strong>{item.label}</strong>
              <span>{item.price}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
