-- ============================================================================
-- Kushi Farm — Update seeded product image URLs to local WebP assets
-- ============================================================================
UPDATE public.products
SET image_url = '/products/' || slug || '.webp'
WHERE slug IN (
  'cows-milk',
  'frozen-paneer',
  'honey',
  'mushroom',
  'sweet-corn',
  'green-peas',
  'fresh-curd',
  'pure-desi-ghee'
);
