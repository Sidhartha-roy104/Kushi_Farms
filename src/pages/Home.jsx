import { useCart } from '../context/CartContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import CustomPackageBuilder from '../components/CustomPackageBuilder';
import ProductGrid from '../components/ProductGrid';
import StoreInfo from '../components/StoreInfo';
import WholesaleBanner from '../components/WholesaleBanner';
import PincodeChecker from '../components/PincodeChecker';
import Footer from '../components/Footer';
import QuickViewModal from '../components/QuickViewModal';
import StoryModal from '../components/StoryModal';
import AdminModal from '../components/AdminModal';
import CookieModal from '../components/CookieModal';
import CartDrawer from '../components/CartDrawer';
import FloatingBasket from '../components/FloatingBasket';
import ToastStack from '../components/ToastStack';

export default function Home() {
  const { activeOverlay, closeAllOverlays } = useCart();

  return (
    <>
      <div className="hero-canvas" id="home">
        <div className="hero-pasture-bg" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1800&q=85"
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="hero-pasture-overlay"></div>
        </div>

        <svg
          className="leaf-decor leaf-top-left"
          viewBox="0 0 90 90"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 68C20 44 42 26 76 18C68 48 48 66 12 68Z"
            fill="#A6D46C"
            opacity="0.65"
          />
          <path
            d="M16 64C34 48 52 34 72 22"
            stroke="#64B232"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6 48C14 34 26 24 44 20C38 36 26 46 6 48Z"
            fill="#8CC648"
            opacity="0.55"
          />
        </svg>

        <svg
          className="leaf-decor leaf-bottom-left"
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 22C34 24 58 40 78 72C46 68 24 52 8 22Z"
            fill="#77BE3F"
            opacity="0.72"
          />
          <path
            d="M12 26C32 40 50 54 74 68"
            stroke="#4D9122"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        <AnnouncementBar />
        <Navbar />

        <section className="hero-main">
          <div className="container">
            <Hero />
            <TrustBar />
          </div>
        </section>
      </div>

      <main>
        <div className="wave-divider wave-from-white" aria-hidden="true">
          <svg
            viewBox="0 0 1440 96"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,36 C360,88 760,10 1140,58 C1285,76 1380,58 1440,42 L1440,96 L0,96 Z"
              fill="rgba(250, 251, 248, 0.55)"
            />
            <path
              d="M0,62 C300,20 720,90 1120,40 C1270,22 1380,44 1440,56 L1440,96 L0,96 Z"
              fill="#FAFBF8"
            />
          </svg>
        </div>

        <CustomPackageBuilder />

        <div className="wave-divider wave-from-milk" aria-hidden="true">
          <svg
            viewBox="0 0 1440 96"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,36 C360,88 760,10 1140,58 C1285,76 1380,58 1440,42 L1440,96 L0,96 Z"
              fill="rgba(242, 247, 252, 0.55)"
            />
            <path
              d="M0,62 C300,20 720,90 1120,40 C1270,22 1380,44 1440,56 L1440,96 L0,96 Z"
              fill="#F2F7FC"
            />
          </svg>
        </div>

        <ProductGrid />

        <div className="wave-divider wave-from-ice" aria-hidden="true">
          <svg
            viewBox="0 0 1440 96"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,44 C340,92 740,14 1120,60 C1280,80 1380,60 1440,46 L1440,96 L0,96 Z"
              fill="rgba(250, 251, 248, 0.55)"
            />
            <path
              d="M0,66 C320,24 760,90 1140,38 C1285,20 1385,42 1440,54 L1440,96 L0,96 Z"
              fill="#FAFBF8"
            />
          </svg>
        </div>

        <StoreInfo />

        <WholesaleBanner />

        <div className="wave-divider wave-from-milk" aria-hidden="true">
          <svg
            viewBox="0 0 1440 96"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,38 C360,90 780,14 1140,58 C1280,76 1380,58 1440,42 L1440,96 L0,96 Z"
              fill="rgba(255, 255, 255, 0.55)"
            />
            <path
              d="M0,60 C280,22 680,90 1080,38 C1260,14 1375,38 1440,50 L1440,96 L0,96 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        <PincodeChecker />

        <div className="wave-divider wave-from-white" aria-hidden="true">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,36 C320,92 720,8 1120,62 C1280,82 1380,58 1440,44 L1440,100 L0,100 Z"
              fill="rgba(18, 86, 168, 0.2)"
            />
            <path
              d="M0,60 C360,14 780,94 1160,42 C1300,24 1390,42 1440,54 L1440,100 L0,100 Z"
              fill="#092554"
            />
          </svg>
        </div>
      </main>

      <Footer />

      <div
        className={`overlay-backdrop${activeOverlay ? ' open' : ''}`}
        id="overlayBackdrop"
        onClick={closeAllOverlays}
      ></div>
      <QuickViewModal />
      <StoryModal />
      <AdminModal />
      <CookieModal />
      <CartDrawer />
      <FloatingBasket />
      <ToastStack />
    </>
  );
}
