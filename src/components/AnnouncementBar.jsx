import { useSettings } from '../context/SettingsContext';

export default function AnnouncementBar() {
  const { settings } = useSettings();

  return (
    <div className="top-bar-wrap">
      <div className="top-bar-pill">
        <div className="top-bar-left">
          <span className="top-bar-truck" aria-hidden="true">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </span>
          <span>
            Free <span className="hide-mobile">home </span>delivery{' '}
            <span className="hide-mobile">on orders </span>above ₹
            {settings.free_delivery_threshold} •{' '}
            <span className="hide-mobile">
              Freshness guaranteed! · Chaparam, Srikakulam (
            </span>
            {settings.store_open}–{settings.store_close}
            <span className="hide-mobile">)</span>
          </span>
        </div>
        <a href="#contact" className="top-bar-link">
          Check Delivery Area →
        </a>
      </div>
    </div>
  );
}
