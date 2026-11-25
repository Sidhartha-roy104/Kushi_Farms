import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const DEFAULT_SETTINGS = {
  id: 1,
  store_name: 'Kushi Dairy Products',
  phone: '8464952708',
  whatsapp_number: '918464952708',
  delivery_fee: 20,
  free_delivery_threshold: 199,
  store_open: '06:30 AM',
  store_close: '10:00 PM',
  serviceable_pincodes: [
    '532001',
    '532401',
    '532402',
    '532403',
    '532404',
    '532405',
    '532407',
    '532408',
    '532409',
    '532410'
  ],
  cod_enabled: false
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(Boolean(supabase));

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (!supabase) {
        setLoadingSettings(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (!cancelled && !error && data) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            delivery_fee: Number(data.delivery_fee ?? DEFAULT_SETTINGS.delivery_fee),
            free_delivery_threshold: Number(
              data.free_delivery_threshold ?? DEFAULT_SETTINGS.free_delivery_threshold
            )
          });
        }
      } catch (err) {
        // Fallback to DEFAULT_SETTINGS if table not yet seeded
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loadingSettings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
