export default function TrustBar() {
  return (
    <>
      <div className="trust-bar-wrap">
        <div className="trust-bar">
          <div className="trust-item">
            <span className="trust-icon green">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
              </svg>
            </span>
            <div>
              <strong>100% Pure</strong>
              <span>No additives</span>
            </div>
          </div>

          <div className="trust-item">
            <span className="trust-icon blue">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </span>
            <div>
              <strong>Hygienic &amp; Safe</strong>
              <span>Trusted quality</span>
            </div>
          </div>

          <div className="trust-item">
            <span className="trust-icon blue">
              <svg
                width="22"
                height="22"
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
            <div>
              <strong>On-Time Delivery</strong>
              <span>Fresh at your doorstep</span>
            </div>
          </div>

          <div className="trust-item">
            <span className="trust-icon green">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </span>
            <div>
              <strong>Supporting Local Farmers</strong>
              <span>Chaparam, Srikakulam</span>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-explore-wrap">
        <span className="scroll-line" aria-hidden="true"></span>
        <a href="#products" className="scroll-explore-link">
          <span>Scroll to explore</span>
          <span className="scroll-arrow-circle" aria-hidden="true">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </span>
        </a>
        <span className="scroll-line" aria-hidden="true"></span>
      </div>
    </>
  );
}
