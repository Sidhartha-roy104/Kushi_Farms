-- ============================================================================
-- Kushi Farm — Seed Settings & 8 Initial Products + Variants
-- ============================================================================

-- 1. Single-row Store Settings
INSERT INTO public.settings (
  id,
  store_name,
  phone,
  whatsapp_number,
  delivery_fee,
  free_delivery_threshold,
  store_open,
  store_close,
  serviceable_pincodes,
  cod_enabled
)
VALUES (
  1,
  'Kushi Dairy Products',
  '8464952708',
  '918464952708',
  20,
  199,
  '06:30 AM',
  '10:00 PM',
  ARRAY['532001','532401','532402','532403','532404','532405','532407','532408','532409','532410'],
  false
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed 8 Products & Their Variants
DO $$
DECLARE
  v_product_id uuid;
BEGIN
  -- 1. Cow's Milk
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'cows-milk',
    'Cow''s Milk',
    'KUSHI DAIRY · DAILY ESSENTIALS',
    '★ 4.9 · Pure',
    'Fresh Daily',
    'green',
    'Dairy',
    ARRAY['Unadulterated', 'Morning Sourced', 'Rich Calcium'],
    'Clean, naturally sweet cow’s milk sourced daily from Chaparam for morning filter coffee, tea, and children’s nutrition.',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/E5F0FF/1256A8?text=Fresh+Cow%27s+Milk',
    'Boil gently on a low flame to enjoy a rich natural malai layer and authentic farm aroma.',
    'Sourced fresh every morning · Best consumed within 24–48 hours when refrigerated.',
    true,
    1
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '250 ml', 12, 12, 0, 50, true, 1),
      (v_product_id, '500 ml', 24, 24, 0, 50, true, 2),
      (v_product_id, '1 L', 48, 48, 0, 50, true, 3);
  END IF;

  -- 2. Frozen Paneer
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'frozen-paneer',
    'Frozen Paneer',
    'KUSHI DAIRY · FRESH CHOICE',
    '★ 4.8 · High Protein',
    'Fresh Choice',
    'blue',
    'Dairy',
    ARRAY['High Protein', 'Soft Cubes', 'Hygienic Seal'],
    'Soft, protein-rich paneer cubes hygienically packed to stay tender in curries, pulao, and tawa fry.',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/F2F7FC/1256A8?text=Frozen+Paneer',
    'Soak cubes in warm salted water for 8 minutes before cooking for melt-in-mouth softness.',
    'Hygienically chilled & sealed · Keep frozen until ready to cook.',
    true,
    2
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '200 g', 55, 55, 0, 50, true, 1),
      (v_product_id, '500 g', 130, 130, 0, 50, true, 2),
      (v_product_id, '1 kg', 250, 250, 0, 50, true, 3);
  END IF;

  -- 3. Honey
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'honey',
    'Honey',
    'KUSHI PANTRY · NATURAL HARVEST',
    '★ 4.9 · Raw',
    '100% Pure',
    'gold',
    'Pantry',
    ARRAY['Zero Added Sugar', 'Natural Enzymes', 'Floral Aroma'],
    'Unadulterated golden natural honey with rich floral notes—no added sugar syrup or artificial flavours.',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/FEF8DF/9A6700?text=100%25+Pure+Honey',
    'Stir a spoonful into warm lemon water every morning or drizzle over fresh curd and fruits.',
    '100% Pure · Store at room temperature away from direct sunlight.',
    true,
    3
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '100 g', 70, 70, 0, 50, true, 1),
      (v_product_id, '250 g', 165, 165, 0, 50, true, 2),
      (v_product_id, '500 g', 310, 310, 0, 50, true, 3);
  END IF;

  -- 4. Mushroom
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'mushroom',
    'Mushroom',
    'KUSHI FARM · FRESH HARVEST',
    '★ 4.8 · Farm Pick',
    'Farm Fresh',
    'green',
    'Farm Fresh',
    ARRAY['Handpicked', 'Rich Vitamin D', 'Cleaned Pack'],
    'Plump, earthy button mushrooms handpicked fresh for Andhra-style mushroom masala, biryani, and pepper fry.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/ECF7E4/3E7F1C?text=Farm+Fresh+Mushroom',
    'Wipe gently or rinse quickly right before slicing so they sear golden instead of steaming.',
    'Farm Fresh · Refrigerate in a breathable pack and use within 3 days.',
    true,
    4
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '200 g', 50, 50, 0, 50, true, 1),
      (v_product_id, '400 g', 95, 95, 0, 50, true, 2);
  END IF;

  -- 5. Sweet Corn
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'sweet-corn',
    'Sweet Corn',
    'KUSHI FARM · GOLDEN KERNELS',
    '★ 4.9 · Crisp',
    'Farm Fresh',
    'gold',
    'Farm Fresh',
    ARRAY['Naturally Sweet', 'Ready to Steam', 'High Fibre'],
    'Juicy, naturally sweet golden kernels ready for evening masala corn chaat, soups, and crispy corn.',
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/FEF8DF/9A6700?text=Farm+Fresh+Sweet+Corn',
    'Steam for 5 minutes and toss with Kushi ghee, chaat masala, chilli powder, and a squeeze of lime.',
    'Farm Fresh · Crisp golden kernels packed cleanly for quick prep.',
    true,
    5
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '200 g', 22, 22, 0, 50, true, 1),
      (v_product_id, '500 g', 52, 52, 0, 50, true, 2),
      (v_product_id, '1 kg', 98, 98, 0, 50, true, 3);
  END IF;

  -- 6. Green Peas
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'green-peas',
    'Green Peas',
    'KUSHI FARM · FRESH HARVEST',
    '★ 4.8 · Tender',
    'Farm Fresh',
    'green',
    'Farm Fresh',
    ARRAY['Tender Pods', 'Plant Protein', 'Quick Cook'],
    'Tender, bright green peas carefully selected for matar paneer, vegetable pulao, upma, and aloo matar.',
    'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/ECF7E4/3E7F1C?text=Farm+Fresh+Green+Peas',
    'Blanch for 2 minutes in boiling water to lock in the vibrant green colour and sweet crunch.',
    'Farm Fresh · Cleaned and ready for everyday family cooking.',
    true,
    6
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '250 g', 50, 50, 0, 50, true, 1),
      (v_product_id, '500 g', 95, 95, 0, 50, true, 2),
      (v_product_id, '1 kg', 185, 185, 0, 50, true, 3);
  END IF;

  -- 7. Fresh Curd
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'fresh-curd',
    'Fresh Curd',
    'KUSHI DAIRY · HOMESTYLE SET',
    '★ 4.9 · Thick',
    'Daily Set',
    'blue',
    'Dairy',
    ARRAY['Live Probiotics', 'Mild & Creamy', 'Set Daily'],
    'Thick, creamy, mildly sweet homestyle perugu (curd) set daily from fresh milk—essential for every Andhra lunch.',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/E5F0FF/1256A8?text=Fresh+Daily+Curd',
    'Perfect for cooling curd rice (daddojanam), onion raita, or whisked into spiced buttermilk.',
    'Set fresh daily · Keep chilled at 4°C for mild, non-sour taste.',
    true,
    7
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '250 g', 25, 25, 0, 50, true, 1),
      (v_product_id, '500 g', 48, 48, 0, 50, true, 2),
      (v_product_id, '1 kg', 92, 92, 0, 50, true, 3);
  END IF;

  -- 8. Pure Desi Ghee
  INSERT INTO public.products (slug, name, brand_line, purity, badge, badge_tone, category, pills, description, image_url, fallback_url, kitchen_tip, storage_tip, is_active, sort_order)
  VALUES (
    'pure-desi-ghee',
    'Pure Desi Ghee',
    'KUSHI DAIRY · TRADITIONAL',
    '★ 5.0 · Grainy',
    'Traditional',
    'gold',
    'Dairy',
    ARRAY['Slow Clarified', 'Rich Aroma', '100% Pure'],
    'Rich, grainy, aromatic desi ghee slow-clarified for hot steamed rice, pappu, dosas, and festive sweets.',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    'https://placehold.co/600x440/FEF8DF/9A6700?text=Pure+Desi+Ghee',
    'Spoon over hot mudda pappu and avakaya rice for an unmistakable coastal Andhra comfort meal.',
    '100% Pure · Naturally shelf-stable in a cool, dry kitchen cupboard.',
    true,
    8
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO public.product_variants (product_id, label, price, mrp, discount_percent, stock, is_active, sort_order) VALUES
      (v_product_id, '200 ml', 160, 160, 0, 50, true, 1),
      (v_product_id, '500 ml', 385, 385, 0, 50, true, 2),
      (v_product_id, '1 L', 750, 750, 0, 50, true, 3);
  END IF;
END $$;
