-- ============================================================================
-- Kushi Farm — Update Serviceable Pincodes (6 zones) & Enable COD
-- ============================================================================

UPDATE public.settings
SET
  serviceable_pincodes = ARRAY['532401', '532001', '532402', '532410', '532403', '532405'],
  cod_enabled = true,
  updated_at = now()
WHERE id = 1;
