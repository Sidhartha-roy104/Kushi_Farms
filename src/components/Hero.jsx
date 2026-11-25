import { useCart } from '../context/CartContext';

export default function Hero() {
  const { openOverlay } = useCart();

  return (
    <div className="hero-grid">
      <div className="hero-copy">
        <div className="pure-pill">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64B232"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
          <span>Pure &nbsp;•&nbsp; Fresh &nbsp;•&nbsp; Healthy</span>
        </div>

        <h1 className="hero-title">
          Simple Goodness.
          <br />
          <span className="hero-title-italic-row">
            <span className="editorial-italic">Every Day.</span>
            <svg
              className="green-swoosh"
              viewBox="0 0 110 28"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 24C28 8 68 2 106 9C72 10 38 14 4 24Z" fill="#64B232" />
            </svg>
          </span>
        </h1>

        <p className="hero-sub">
          From our <strong>Chaparam</strong> farm to your family’s table, discover
          the pure taste of Kushi Dairy—fresh milk, curd, ghee, paneer, honey
          &amp; everyday essentials.
        </p>

        <div className="hero-actions">
          <a href="#products" className="btn-primary">
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
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Browse Our Products →
          </a>
          <button
            className="btn-outline"
            id="heroStoryBtn"
            onClick={() => openOverlay('story')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1256A8"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8" fill="#1256A8"></polygon>
            </svg>
            Our Story
          </button>
        </div>
      </div>

      <div className="hero-stage">
        <div className="purely-yours" aria-hidden="true">
          <div className="purely-yours-text">
            <span>Purely Yours</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <svg width="110" height="14" viewBox="0 0 110 14" fill="none">
            <path
              d="M4 11C34 4 74 3 106 8"
              stroke="#1256A8"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="bottle-composition">
          <svg
            className="hero-bottle-svg"
            viewBox="0 0 520 430"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Kushi Dairy glass milk bottle with fresh milk splash and glass of milk on a wooden board"
          >
            <defs>
              <linearGradient
                id="milkGrad"
                x1="200"
                y1="115"
                x2="310"
                y2="355"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#F7F5EE" />
                <stop offset="100%" stopColor="#ECE7DA" />
              </linearGradient>
              <linearGradient
                id="glassShine"
                x1="205"
                y1="80"
                x2="245"
                y2="350"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient
                id="capGrad"
                x1="218"
                y1="42"
                x2="292"
                y2="66"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#2575D6" />
                <stop offset="50%" stopColor="#1256A8" />
                <stop offset="100%" stopColor="#09346B" />
              </linearGradient>
              <linearGradient
                id="woodGrad"
                x1="90"
                y1="350"
                x2="465"
                y2="395"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#C98E55" />
                <stop offset="50%" stopColor="#9E6231" />
                <stop offset="100%" stopColor="#76451E" />
              </linearGradient>
              <linearGradient
                id="splashGrad"
                x1="78"
                y1="130"
                x2="225"
                y2="310"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#EBF2F9" />
              </linearGradient>
            </defs>

            <path
              d="M210 184C185 150 132 132 110 154C90 174 114 212 94 238C74 264 60 240 68 214C50 236 62 288 102 310C140 330 186 334 218 326V184H210Z"
              fill="url(#splashGrad)"
            />
            <circle cx="116" cy="126" r="7" fill="#FFFFFF" />
            <circle cx="84" cy="166" r="5" fill="#FFFFFF" />
            <circle cx="62" cy="196" r="4" fill="#FFFFFF" />
            <circle cx="144" cy="112" r="4.5" fill="#FFFFFF" />

            <ellipse
              cx="278"
              cy="378"
              rx="198"
              ry="28"
              fill="#092554"
              fillOpacity="0.16"
            />
            <path
              d="M96 356C96 346 112 340 134 340H428C450 340 464 346 464 356V368C464 380 448 388 424 388H136C112 388 96 380 96 368V356Z"
              fill="url(#woodGrad)"
            />
            <path
              d="M104 353C104 346 118 342 138 342H422C442 342 456 346 456 353C456 360 442 365 422 365H138C118 365 104 360 104 353Z"
              fill="#D59E66"
              fillOpacity="0.45"
            />

            <ellipse
              cx="255"
              cy="356"
              rx="68"
              ry="12"
              fill="#4A270E"
              fillOpacity="0.28"
            />
            <ellipse
              cx="384"
              cy="356"
              rx="46"
              ry="10"
              fill="#4A270E"
              fillOpacity="0.26"
            />

            <path
              d="M225 66H285V98C285 118 318 142 318 184V336C318 352 304 360 286 360H224C206 360 192 352 192 336V184C192 142 225 118 225 98V66Z"
              fill="url(#milkGrad)"
              stroke="#D9E4F0"
              strokeWidth="2.5"
            />
            <ellipse cx="255" cy="108" rx="31" ry="6" fill="#FFFFFF" />
            <rect
              x="218"
              y="42"
              width="74"
              height="26"
              rx="8"
              fill="url(#capGrad)"
            />
            <rect
              x="224"
              y="47"
              width="62"
              height="5"
              rx="2.5"
              fill="#FFFFFF"
              fillOpacity="0.28"
            />
            <path
              d="M206 184C206 154 226 130 232 108H244C238 130 220 154 220 184V334C220 342 224 346 228 348H214C208 346 206 341 206 334V184Z"
              fill="url(#glassShine)"
            />
            <path
              d="M304 186V334"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeOpacity="0.65"
            />

            <g transform="translate(216, 198)">
              <path
                d="M39 0C39 0 54 15.5 54 25.5C54 33.8 47.3 40.5 39 40.5C30.7 40.5 24 33.8 24 25.5C24 15.5 39 0 39 0Z"
                fill="#DDF0FF"
                stroke="#1256A8"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <circle cx="44" cy="16" r="3.2" fill="#F7D138" />
              <path
                d="M27 28.5C31 25.5 36.2 25.5 40 28C43.5 30.2 47.6 29.4 51 27C50 33.6 45 38 39 38C33.2 38 28.2 34.2 27 28.5Z"
                fill="#64B232"
              />
              <text
                x="39"
                y="65"
                textAnchor="middle"
                fill="#0D458A"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                fontSize="25"
                letterSpacing="-0.03em"
              >
                Kushi
              </text>
              <text
                x="39"
                y="79"
                textAnchor="middle"
                fill="#1256A8"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="700"
                fontSize="10.5"
                letterSpacing="0.24em"
              >
                DAIRY
              </text>
              <path
                d="M68 44C68 40 72 37 76.5 37.5C76 41.8 72.8 45 68 44Z"
                fill="#64B232"
              />
            </g>

            <path
              d="M340 198H428L418 346C417 355 410 360 400 360H368C358 360 351 355 350 346L340 198Z"
              fill="#FFFFFF"
              fillOpacity="0.45"
              stroke="#DDE8F4"
              strokeWidth="2.2"
            />
            <path
              d="M344 218H424L416 342C415 350 409 354 400 354H368C359 354 353 350 352 342L344 218Z"
              fill="url(#milkGrad)"
            />
            <ellipse cx="384" cy="218" rx="40" ry="6.5" fill="#FFFFFF" />
            <ellipse
              cx="384"
              cy="198"
              rx="44"
              ry="7"
              fill="#FFFFFF"
              fillOpacity="0.35"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M352 214L359 342"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />

            <g transform="translate(152, 326)">
              <circle cx="0" cy="-7" r="4.5" fill="#FFFFFF" />
              <circle cx="6.5" cy="-2" r="4.5" fill="#FFFFFF" />
              <circle cx="4" cy="5.5" r="4.5" fill="#FFFFFF" />
              <circle cx="-4" cy="5.5" r="4.5" fill="#FFFFFF" />
              <circle cx="-6.5" cy="-2" r="4.5" fill="#FFFFFF" />
              <circle cx="0" cy="0" r="3.6" fill="#F7C927" />
            </g>
            <g transform="translate(174, 336) scale(0.82)">
              <circle cx="0" cy="-7" r="4.5" fill="#FFFFFF" />
              <circle cx="6.5" cy="-2" r="4.5" fill="#FFFFFF" />
              <circle cx="4" cy="5.5" r="4.5" fill="#FFFFFF" />
              <circle cx="-4" cy="5.5" r="4.5" fill="#FFFFFF" />
              <circle cx="-6.5" cy="-2" r="4.5" fill="#FFFFFF" />
              <circle cx="0" cy="0" r="3.6" fill="#F7C927" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
