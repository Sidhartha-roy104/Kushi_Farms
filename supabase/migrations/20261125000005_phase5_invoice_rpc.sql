-- ============================================================================
-- Kushi Farm — Phase 5: Atomic Invoice Number Assignment RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.assign_invoice_number(p_order_id uuid)
RETURNS TABLE(invoice_number text, invoice_generated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_inv_no text;
  v_inv_at timestamptz;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.invoice_number IS NOT NULL THEN
    RETURN QUERY SELECT v_order.invoice_number, v_order.invoice_generated_at;
    RETURN;
  END IF;

  v_inv_no := 'INV-' || lpad(nextval('public.invoice_num_seq')::text, 6, '0');
  v_inv_at := now();

  UPDATE public.orders
  SET invoice_number = v_inv_no,
      invoice_generated_at = v_inv_at
  WHERE id = v_order.id;

  RETURN QUERY SELECT v_inv_no, v_inv_at;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_invoice_number(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_invoice_number(uuid) TO service_role;
