-- ============================================================================
-- Kushi Farm — Update Pack Sizes & Prices for Milk, Curd, Ghee, and Paneer
-- ============================================================================
DO $$
DECLARE
  v_milk_id uuid;
  v_curd_id uuid;
  v_ghee_id uuid;
  v_paneer_id uuid;
BEGIN
  SELECT id INTO v_milk_id FROM public.products WHERE slug = 'cows-milk';
  SELECT id INTO v_curd_id FROM public.products WHERE slug = 'fresh-curd';
  SELECT id INTO v_ghee_id FROM public.products WHERE slug = 'pure-desi-ghee';
  SELECT id INTO v_paneer_id FROM public.products WHERE slug = 'frozen-paneer';

  IF v_milk_id IS NOT NULL THEN
    DELETE FROM public.product_variants WHERE product_id = v_milk_id;
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_milk_id, '200 ml', 10, 10, 0, 50, true, 1),
      (v_milk_id, '500 ml', 30, 30, 0, 50, true, 2);
  END IF;

  IF v_curd_id IS NOT NULL THEN
    DELETE FROM public.product_variants WHERE product_id = v_curd_id;
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_curd_id, '180 g', 10, 10, 0, 50, true, 1),
      (v_curd_id, '450 g', 32, 32, 0, 50, true, 2);
  END IF;

  IF v_ghee_id IS NOT NULL THEN
    DELETE FROM public.product_variants WHERE product_id = v_ghee_id;
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_ghee_id, '250 g', 350, 350, 0, 50, true, 1),
      (v_ghee_id, '500 g', 650, 650, 0, 50, true, 2),
      (v_ghee_id, '1 kg', 1200, 1200, 0, 50, true, 3);
  END IF;

  IF v_paneer_id IS NOT NULL THEN
    DELETE FROM public.product_variants WHERE product_id = v_paneer_id;
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_paneer_id, '200 g', 95, 95, 0, 50, true, 1),
      (v_paneer_id, '500 g', 255, 255, 0, 50, true, 2),
      (v_paneer_id, '1 kg', 450, 450, 0, 50, true, 3);
  END IF;
END $$;
