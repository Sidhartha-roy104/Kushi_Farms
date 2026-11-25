import { useState } from 'react';
import { WHATSAPP_NUMBER } from '../data/products';

const LOCAL_KEYWORDS = [
  'chaparam',
  'patrunivalasa',
  'srikakulam',
  'amadalavalasa',
  'narasannapeta',
  'etcharla',
  'ranastalam'
];

export default function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null); // { type: 'success' | 'info', val: string }

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = pincode.trim();
    if (!val) return;
    const lower = val.toLowerCase();
    const isSrikakulamPin = /^532\d{3}$/.test(val);
    const isLocalArea = LOCAL_KEYWORDS.some((k) => lower.includes(k));

    if (isSrikakulamPin || isLocalArea) {
      setResult({ type: 'success', val });
    } else {
      setResult({ type: 'info', val });
    }
  };

  return (
    <section className="section section-white" id="contact">
      <div className="container">
        <div className="contact-band">
          <div>
            <span className="eyebrow">LET’S MAKE YOUR DAY A LITTLE BETTER</span>
            <h2>A question? We’re just a message away.</h2>
            <p>Ask about products, availability and delivery to your pincode.</p>

            <div className="contact-direct-btns">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Kushi%20Dairy!%20I%20would%20like%20to%20check%20product%20availability.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Chat on WhatsApp
              </a>
              <a href="tel:+918464952708" className="btn-call-light">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Call +91 8464952708
              </a>
            </div>
          </div>

          <div className="pincode-box">
            <h3>Check Pincode or Area Availability</h3>
            <p>
              Enter your Srikakulam pincode (e.g., 532401, 532001) or
              village/colony name.
            </p>
            <form className="pincode-form" id="pincodeForm" onSubmit={handleSubmit}>
              <input
                type="text"
                id="pincodeInput"
                className="pincode-input"
                placeholder="e.g., 532401 or Patrunivalasa"
                aria-label="Enter pincode or area name"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
              <button type="submit" className="pincode-submit">
                Check
              </button>
            </form>
            <div
              className={`pincode-result${result ? ` ${result.type}` : ''}`}
              id="pincodeResult"
              aria-live="polite"
            >
              {result?.type === 'success' && (
                <>
                  <strong>Great news! We deliver to {result.val}.</strong> Daily
                  fresh stock from Chaparam Village is available between 06:30
                  AM–10:00 PM.
                </>
              )}
              {result?.type === 'info' && (
                <>
                  We’d love to check delivery for <strong>{result.val}</strong>.{' '}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      `Hello Kushi Dairy! Do you deliver to ${result.val}?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', fontWeight: 700 }}
                  >
                    Message us on WhatsApp →
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
