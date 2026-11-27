-- ============================================================================
-- Kushi Farm — Phase 3: Atomic Payment Completion & Stock Decrement RPCs
-- ============================================================================

-- Add nullable variant_id snapshot reference to order_items for atomic stock decrement
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- Atomic payment verification & stock decrement (idempotent)
CREATE OR REPLACE FUNCTION public.complete_razorpay_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text
)
RETURNS texthye 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
  v_current_stock integer;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE razorpay_order_id = p_razorpay_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found for razorpay_order_id %', p_razorpay_order_id;
  END IF;

  -- Idempotency: already paid, return existing order_ref without re-decrementing stock
  IF v_order.payment_status = 'paid' THEN
    RETURN v_order.order_ref;
  END IF;

  -- Decrement stock atomically for every item in the order
  FOR v_item IN
    SELECT variant_id, product_name, variant_label, qty
    FROM public.order_items
    WHERE order_id = v_order.id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      SELECT stock
      INTO v_current_stock
      FROM public.product_variants
      WHERE id = v_item.variant_id
      FOR UPDATE;

      IF NOT FOUND OR v_current_stock < v_item.qty THEN
        RAISE EXCEPTION 'Insufficient stock for % (%)', v_item.product_name, v_item.variant_label;
      END IF;

      UPDATE public.product_variants
      SET stock = stock - v_item.qty
      WHERE id = v_item.variant_id;
    END IF;
  END LOOP;

  UPDATE public.orders
  SET payment_status = 'paid',
      razorpay_payment_id = COALESCE(p_razorpay_payment_id, razorpay_payment_id)
  WHERE id = v_order.id;

  RETURN v_order.order_ref;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_razorpay_payment(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_razorpay_payment(text, text) TO service_role;

-- Atomic stock decrement for Cash on Delivery (when settings.cod_enabled = true)
CREATE OR REPLACE FUNCTION public.decrement_order_stock(
  p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_current_stock integer;
BEGIN
  FOR v_item IN
    SELECT variant_id, product_name, variant_label, qty
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      SELECT stock
      INTO v_current_stock
      FROM public.product_variants
      WHERE id = v_item.variant_id
      FOR UPDATE;

      IF NOT FOUND OR v_current_stock < v_item.qty THEN
        RAISE EXCEPTION 'Insufficient stock for % (%)', v_item.product_name, v_item.variant_label;
      END IF;

      UPDATE public.product_variants
      SET stock = stock - v_item.qty
      WHERE id = v_item.variant_id;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_order_stock(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_order_stock(uuid) TO service_role;
