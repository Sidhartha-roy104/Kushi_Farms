import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useSettings } from '../context/SettingsContext';

const POLICIES = {
  terms: {
    eyebrow: 'LEGAL & POLICIES',
    title: 'Terms &',
    italic: 'Conditions',
    updated: 'November 26, 2026',
    sections: [
      {
        heading: '1. About Us',
        body: 'This website (kushifarm.com) is operated by Kushi Dairy Products, located at Chaparam Village, Patrunivalasa Post, Srikakulam, Andhra Pradesh, India.'
      },
      {
        heading: '2. Orders & Availability',
        body: 'All fresh dairy and farm products are subject to daily stock availability. Prices and pack sizes are listed in Indian Rupees (INR). We reserve the right to limit quantities or cancel an order if an item is out of stock, in which case a full refund will be issued.'
      },
      {
        heading: '3. Payments',
        body: 'Online payments are processed securely through Razorpay (UPI, cards, and netbanking). Orders are confirmed only after successful payment verification.'
      },
      {
        heading: '4. Local Delivery',
        body: 'We deliver to serviceable pincodes in and around Chaparam and Srikakulam during store hours (06:30 AM – 10:00 PM). Please ensure someone is available at the delivery address to receive fresh perishable items.'
      },
      {
        heading: '5. Contact',
        body: 'For any questions regarding these terms, call or WhatsApp us at +91 8464952708.'
      }
    ]
  },
  privacy: {
    eyebrow: 'LEGAL & POLICIES',
    title: 'Privacy',
    italic: 'Policy',
    updated: 'November 26, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'When you place an order on kushifarm.com, we collect your name, 10-digit mobile number, delivery address, landmark, and pincode solely to fulfil and deliver your order and provide order tracking.'
      },
      {
        heading: '2. Payment Security',
        body: 'We do not store your card, UPI, or banking credentials on our servers. All online transactions are handled directly by Razorpay using encrypted payment gateways.'
      },
      {
        heading: '3. Data Usage & Sharing',
        body: 'We never sell or rent your personal data. Your contact and address details are used strictly for order confirmation, delivery coordination, and invoice generation.'
      },
      {
        heading: '4. Cookies & Local Storage',
        body: 'We use essential browser storage to keep your shopping basket intact while browsing. We do not use invasive third-party ad trackers.'
      },
      {
        heading: '5. Contact Us',
        body: 'To request updates or deletion of your order contact details, reach us at +91 8464952708.'
      }
    ]
  },
  refund: {
    eyebrow: 'LEGAL & POLICIES',
    title: 'Refund &',
    italic: 'Cancellation Policy',
    updated: 'November 26, 2026',
    sections: [
      {
        heading: '1. Order Cancellation',
        body: 'Because milk, curd, paneer, and farm produce are fresh perishables, orders may be cancelled before they are marked "Accepted" or "On the way" by calling or WhatsApping +91 8464952708 immediately with your Order Reference.'
      },
      {
        heading: '2. Damaged, Spoiled, or Wrong Items',
        body: 'If you receive a damaged, leaked, or incorrect item, please notify us on WhatsApp (+91 8464952708) within 4 hours of delivery with a photo and your Order Reference. We will arrange a replacement or full refund for the affected item.'
      },
      {
        heading: '3. Refund Processing Time',
        body: 'Approved refunds for online Razorpay payments are initiated back to your original payment method within 5–7 business days.'
      }
    ]
  },
  shipping: {
    eyebrow: 'LEGAL & POLICIES',
    title: 'Shipping &',
    italic: 'Delivery Policy',
    updated: 'November 26, 2026',
    sections: [
      {
        heading: '1. Serviceable Areas',
        body: 'Kushi Dairy Products currently delivers across Chaparam Village, Patrunivalasa, and serviceable Srikakulam pincodes (532001, 532401–532410). You can check your pincode on the home page before ordering.'
      },
      {
        heading: '2. Delivery Hours & Timelines',
        body: 'Our store operates daily from 06:30 AM to 10:00 PM. Local orders placed during store hours are typically delivered same-day or in the next morning/evening fresh batch.'
      },
      {
        heading: '3. Delivery Charges',
        body: 'Orders above the free-delivery threshold (₹199) qualify for FREE local delivery. Orders below the threshold carry a standard local delivery fee as shown at checkout.'
      }
    ]
  }
};

export default function LegalPage({ type }) {
  const { settings } = useSettings();
  const policy = POLICIES[type] || POLICIES.terms;

  return (
    <div
      className="status-page-shell"
      style={{ alignItems: 'flex-start', paddingTop: '42px', paddingBottom: '56px' }}
    >
      <div
        className="status-card"
        style={{ maxWidth: '760px', textAlign: 'left' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '22px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <Link to="/" aria-label="Kushi Dairy Home">
            <Logo variant="dark" height={44} />
          </Link>
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--brand-blue)'
            }}
          >
            ← Back to Store
          </Link>
        </div>

        <span className="eyebrow">{policy.eyebrow}</span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', marginBottom: '6px' }}>
          {policy.title}{' '}
          <span className="editorial-italic">{policy.italic}</span>
        </h1>
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-tertiary)',
            marginBottom: '22px'
          }}
        >
          Last updated: {policy.updated} · {settings.store_name} (Chaparam,
          Srikakulam)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {policy.sections.map((sec) => (
            <section key={sec.heading}>
              <h2
                style={{
                  fontSize: '1.04rem',
                  marginBottom: '6px',
                  color: 'var(--navy-deep)'
                }}
              >
                {sec.heading}
              </h2>
              <p
                style={{
                  fontSize: '0.93rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7
                }}
              >
                {sec.body}
              </p>
            </section>
          ))}
        </div>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: 'var(--brand-blue)'
          }}
        >
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund-policy">Refund &amp; Cancellation</Link>
          <Link to="/shipping-policy">Shipping &amp; Delivery</Link>
        </div>
      </div>
    </div>
  );
}
