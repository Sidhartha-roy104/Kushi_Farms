-- Allow storefront visitors to view inactive products/variants so they render
-- as greyed-out "Currently Not Available" instead of disappearing.
-- Server-side checkout (create-order) still enforces is_active = true.

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view all products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can view active product variants" ON public.product_variants;
CREATE POLICY "Public can view all product variants"
  ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);
