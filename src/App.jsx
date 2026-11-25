import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import OrderSuccess from './pages/OrderSuccess';
import Track from './pages/Track';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import LegalPage from './pages/LegalPage';

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/track" element={<Track />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route
              path="/refund-policy"
              element={<LegalPage type="refund" />}
            />
            <Route
              path="/shipping-policy"
              element={<LegalPage type="shipping" />}
            />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SettingsProvider>
  );
}
