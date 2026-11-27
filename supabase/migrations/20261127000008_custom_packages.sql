-- ============================================================================
-- Kushi Farm — Custom Family Package Tables, Indexes, RLS & Explicit Grants
-- ============================================================================

-- 1. Main table to store submitted Custom Family Packages
CREATE TABLE IF NOT EXISTS public.custom_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_phone TEXT,
  delivery_area TEXT,
  daily_slot TEXT NOT NULL DEFAULT 'Morning (06:30–08:30 AM)',
  twice_weekly_days TEXT NOT NULL DEFAULT 'Wed & Sun',
  festivals TEXT[] NOT NULL DEFAULT '{}',
  raw_monthly_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_monthly_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Line items belonging to each Custom Package
CREATE TABLE IF NOT EXISTS public.custom_package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.custom_packages(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'twice_weekly', 'monthly', 'festival')),
  monthly_multiplier INTEGER NOT NULL DEFAULT 1,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Optional schedule tag for package items added to normal orders
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS delivery_schedule TEXT;

-- 4. Indexes for fast Admin Dashboard queries
CREATE INDEX IF NOT EXISTS idx_custom_packages_status ON public.custom_packages(status);
CREATE INDEX IF NOT EXISTS idx_custom_packages_created_at ON public.custom_packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_package_items_package_id ON public.custom_package_items(package_id);

-- 5. Enable Row Level Security & Explicit Grants
ALTER TABLE public.custom_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_package_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.custom_packages FROM PUBLIC;
REVOKE ALL ON TABLE public.custom_package_items FROM PUBLIC;

GRANT INSERT ON TABLE public.custom_packages TO anon, authenticated;
GRANT INSERT ON TABLE public.custom_package_items TO anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.custom_packages TO authenticated;
GRANT SELECT ON TABLE public.custom_package_items TO authenticated;
GRANT ALL ON TABLE public.custom_packages TO service_role;
GRANT ALL ON TABLE public.custom_package_items TO service_role;

-- Allow guests (anon) & logged-in users to submit a custom package
CREATE POLICY "Allow public insert on custom_packages"
  ON public.custom_packages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert on custom_package_items"
  ON public.custom_package_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow store admins to view and manage packages
CREATE POLICY "Allow admin read on custom_packages"
  ON public.custom_packages FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow admin update on custom_packages"
  ON public.custom_packages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin read on custom_package_items"
  ON public.custom_package_items FOR SELECT
  TO authenticated
  USING (public.is_admin());
