-- ============================================================================
-- Kushi Farm — Initial Schema, Sequences, RLS Policies & Explicit Grants
-- Note: Auto-grant is disabled and RLS auto-enable is on.
-- Every table explicitly enables RLS and defines explicit GRANTs.
-- ============================================================================

-- 1. ADMINS TABLE & HELPER FUNCTION
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- Admins grants: no grants to anon; authenticated may SELECT only their own row
REVOKE ALL ON TABLE public.admins FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.admins TO authenticated;
GRANT ALL ON TABLE public.admins TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

CREATE POLICY "Admins can view own row"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  brand_line text NOT NULL DEFAULT 'KUSHI DAIRY · DAILY ESSENTIALS',
  purity text NOT NULL DEFAULT '★ 4.9 · Pure',
  badge text NOT NULL DEFAULT 'Fresh Daily',
  badge_tone text NOT NULL DEFAULT 'green' CHECK (badge_tone IN ('green', 'blue', 'gold')),
  category text NOT NULL,
  pills text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  fallback_url text NOT NULL DEFAULT '',
  kitchen_tip text NOT NULL DEFAULT '',
  storage_tip text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.products FROM PUBLIC;
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;

CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  mrp numeric(10, 2),
  discount_percent integer NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  stock integer NOT NULL DEFAULT 50 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.product_variants FROM PUBLIC;
GRANT SELECT ON TABLE public.product_variants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.product_variants TO authenticated;
GRANT ALL ON TABLE public.product_variants TO service_role;

CREATE POLICY "Public can view active product variants"
  ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true
    ))
    OR public.is_admin()
  );

CREATE POLICY "Admins can insert product variants"
  ON public.product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update product variants"
  ON public.product_variants
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete product variants"
  ON public.product_variants
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. SEQUENCES FOR ORDER REF & INVOICE NUMBER
CREATE SEQUENCE IF NOT EXISTS public.order_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.invoice_num_seq START 1;

REVOKE ALL ON SEQUENCE public.order_ref_seq FROM PUBLIC, anon;
REVOKE ALL ON SEQUENCE public.invoice_num_seq FROM PUBLIC, anon;
GRANT USAGE, SELECT ON SEQUENCE public.order_ref_seq TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.invoice_num_seq TO authenticated, service_role;

-- 5. ORDERS TABLE (NO PUBLIC ACCESS)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref text UNIQUE NOT NULL DEFAULT ('KF-' || lpad(nextval('public.order_ref_seq')::text, 6, '0')),
  customer_name text NOT NULL,
  phone text NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  address jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee numeric(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total numeric(10, 2) NOT NULL CHECK (total >= 0),
  payment_method text NOT NULL DEFAULT 'razorpay' CHECK (payment_method IN ('razorpay', 'cod')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'accepted', 'on_the_way', 'delivered')),
  invoice_number text UNIQUE,
  invoice_generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON public.orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.orders FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;

CREATE POLICY "Admins have full access to orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. ORDER ITEMS TABLE (SNAPSHOT, NO PUBLIC ACCESS)
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  variant_label text NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  line_total numeric(10, 2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.order_items FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;

CREATE POLICY "Admins have full access to order items"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. SETTINGS TABLE (SINGLE ROW)
CREATE TABLE IF NOT EXISTS public.settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text NOT NULL DEFAULT 'Kushi Dairy Products',
  phone text NOT NULL DEFAULT '8464952708',
  whatsapp_number text NOT NULL DEFAULT '918464952708',
  delivery_fee numeric(10, 2) NOT NULL DEFAULT 20 CHECK (delivery_fee >= 0),
  free_delivery_threshold numeric(10, 2) NOT NULL DEFAULT 199 CHECK (free_delivery_threshold >= 0),
  store_open text NOT NULL DEFAULT '06:30 AM',
  store_close text NOT NULL DEFAULT '10:00 PM',
  serviceable_pincodes text[] NOT NULL DEFAULT ARRAY[
    '532001', '532401', '532402', '532403', '532404',
    '532405', '532407', '532408', '532409', '532410'
  ],
  cod_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.settings FROM PUBLIC;
GRANT SELECT ON TABLE public.settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.settings TO authenticated;
GRANT ALL ON TABLE public.settings TO service_role;

CREATE POLICY "Public can view store settings"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert store settings"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update store settings"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete store settings"
  ON public.settings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 8. STORAGE BUCKET FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can read product images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products' AND public.is_admin())
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'products' AND public.is_admin());
