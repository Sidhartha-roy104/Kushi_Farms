import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'kushi_customer_profile';
const CustomerContext = createContext(null);

function readStoredCustomer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id && parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => readStoredCustomer());

  const persistCustomer = useCallback((profile) => {
    setCustomer(profile);
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const signup = useCallback(
    async ({ email, address, password }) => {
      if (!supabase) throw new Error('Store connection is unavailable.');
      const { data, error } = await supabase.rpc('signup_customer', {
        p_email: email,
        p_address: address,
        p_password: password
      });
      if (error) throw new Error(error.message || 'Signup failed.');
      persistCustomer(data);

      // Fire-and-forget welcome email
      supabase.functions
        .invoke('send-customer-email', {
          body: { type: 'welcome', email: data.email }
        })
        .catch(() => {});

      return data;
    },
    [persistCustomer]
  );

  const login = useCallback(
    async ({ email, password }) => {
      if (!supabase) throw new Error('Store connection is unavailable.');
      const { data, error } = await supabase.rpc('login_customer', {
        p_email: email,
        p_password: password
      });
      if (error) throw new Error(error.message || 'Invalid email or password.');
      persistCustomer(data);
      return data;
    },
    [persistCustomer]
  );

  const updateAddress = useCallback(
    async (newAddress) => {
      if (!supabase || !customer?.id) {
        throw new Error('Please login to update your address.');
      }
      const { data, error } = await supabase.rpc('update_customer_address', {
        p_customer_id: customer.id,
        p_address: newAddress
      });
      if (error) throw new Error(error.message || 'Could not update address.');
      persistCustomer({ ...customer, ...data });
      return data;
    },
    [customer, persistCustomer]
  );

  const logout = useCallback(() => {
    persistCustomer(null);
  }, [persistCustomer]);

  const value = useMemo(
    () => ({
      customer,
      isLoggedIn: Boolean(customer?.id),
      signup,
      login,
      logout,
      updateAddress
    }),
    [customer, signup, login, logout, updateAddress]
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return ctx;
}
