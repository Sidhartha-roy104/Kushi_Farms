-- ============================================================================
-- Kushi Farm — Customer Profiles, Custom Auth (pgcrypto) & Subscriptions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Custom Customer Profiles Table (No Supabase Auth required)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  password_hash TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Customer Subscriptions Table (1-Month & 3-Month Plans)
CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months IN (1, 3)),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'paused')),
  expiry_reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Link existing orders & custom_packages to customer_profiles (nullable so guest checkout still works)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.custom_packages
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.customer_profiles (lower(email));
CREATE INDEX IF NOT EXISTS idx_customer_subs_customer_id ON public.customer_subscriptions (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_subs_end_date ON public.customer_subscriptions (end_date);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);

-- Strict RLS: never expose password_hash or other customers' data to anon
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.customer_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.customer_subscriptions FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.customer_profiles TO service_role;
GRANT ALL ON TABLE public.customer_subscriptions TO service_role;

-- 4. Secure Signup RPC (hashes password with bcrypt, never exposes hash)
CREATE OR REPLACE FUNCTION public.signup_customer(
  p_email TEXT,
  p_address TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_clean_email TEXT := lower(trim(p_email));
  v_user RECORD;
BEGIN
  IF v_clean_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;

  IF length(trim(p_address)) < 5 THEN
    RAISE EXCEPTION 'Please enter a valid delivery address.';
  END IF;

  IF length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.customer_profiles WHERE lower(email) = v_clean_email) THEN
    RAISE EXCEPTION 'An account with this email already exists. Please login.';
  END IF;

  INSERT INTO public.customer_profiles (email, delivery_address, password_hash)
  VALUES (v_clean_email, trim(p_address), crypt(p_password, gen_salt('bf')))
  RETURNING id, email, delivery_address, created_at INTO v_user;

  RETURN jsonb_build_object(
    'id', v_user.id,
    'email', v_user.email,
    'delivery_address', v_user.delivery_address,
    'created_at', v_user.created_at
  );
END;
$$;

-- 5. Secure Login RPC (verifies bcrypt hash)
CREATE OR REPLACE FUNCTION public.login_customer(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_clean_email TEXT := lower(trim(p_email));
  v_user RECORD;
BEGIN
  SELECT id, email, delivery_address, password_hash, created_at
  INTO v_user
  FROM public.customer_profiles
  WHERE lower(email) = v_clean_email;

  IF v_user IS NULL OR v_user.password_hash <> crypt(p_password, v_user.password_hash) THEN
    RAISE EXCEPTION 'Invalid email or password.';
  END IF;

  RETURN jsonb_build_object(
    'id', v_user.id,
    'email', v_user.email,
    'delivery_address', v_user.delivery_address,
    'created_at', v_user.created_at
  );
END;
$$;

-- 6. Update Delivery Address RPC
CREATE OR REPLACE FUNCTION public.update_customer_address(
  p_customer_id UUID,
  p_address TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
BEGIN
  IF length(trim(p_address)) < 5 THEN
    RAISE EXCEPTION 'Please enter a valid delivery address.';
  END IF;

  UPDATE public.customer_profiles
  SET delivery_address = trim(p_address), updated_at = now()
  WHERE id = p_customer_id
  RETURNING id, email, delivery_address INTO v_user;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Customer profile not found.';
  END IF;

  RETURN jsonb_build_object(
    'id', v_user.id,
    'email', v_user.email,
    'delivery_address', v_user.delivery_address
  );
END;
$$;

-- 7. Fetch Customer Dashboard (Subscriptions + Order History with Items)
CREATE OR REPLACE FUNCTION public.get_customer_dashboard(
  p_customer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subs JSONB;
  v_orders JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(to_jsonb(s) ORDER BY s.end_date DESC, s.created_at DESC),
    '[]'::jsonb
  )
  INTO v_subs
  FROM public.customer_subscriptions s
  WHERE s.customer_id = p_customer_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'order_ref', o.order_ref,
        'subtotal', o.subtotal,
        'delivery_fee', o.delivery_fee,
        'total', o.total,
        'payment_method', o.payment_method,
        'payment_status', o.payment_status,
        'status', o.status,
        'customer_email', o.customer_email,
        'address', o.address,
        'created_at', o.created_at,
        'order_items', COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', oi.id,
                'variant_id', oi.variant_id,
                'product_name', oi.product_name,
                'variant_label', oi.variant_label,
                'qty', oi.qty,
                'unit_price', oi.unit_price,
                'line_total', oi.line_total
              )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
          ),
          '[]'::jsonb
        )
      )
      ORDER BY o.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_orders
  FROM public.orders o
  WHERE o.customer_id = p_customer_id;

  RETURN jsonb_build_object(
    'subscriptions', v_subs,
    'orders', v_orders
  );
END;
$$;

-- 8. Create or Renew Customer Subscription (service_role only)
CREATE OR REPLACE FUNCTION public.create_or_renew_customer_subscription(
  p_customer_id UUID,
  p_plan_name TEXT,
  p_duration_months INTEGER,
  p_items JSONB,
  p_amount_paid NUMERIC,
  p_razorpay_payment_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := CASE WHEN p_duration_months = 3 THEN 90 ELSE 30 END;
  v_existing RECORD;
  v_sub_id UUID;
BEGIN
  SELECT *
  INTO v_existing
  FROM public.customer_subscriptions
  WHERE customer_id = p_customer_id
    AND duration_months = p_duration_months
    AND end_date >= CURRENT_DATE
  ORDER BY end_date DESC
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    UPDATE public.customer_subscriptions
    SET
      end_date = v_existing.end_date + v_days,
      amount_paid = v_existing.amount_paid + p_amount_paid,
      razorpay_payment_id = COALESCE(p_razorpay_payment_id, v_existing.razorpay_payment_id),
      status = 'active',
      expiry_reminder_sent = false,
      updated_at = now()
    WHERE id = v_existing.id
    RETURNING id INTO v_sub_id;
  ELSE
    INSERT INTO public.customer_subscriptions (
      customer_id,
      plan_name,
      duration_months,
      start_date,
      end_date,
      items,
      amount_paid,
      razorpay_payment_id,
      status,
      expiry_reminder_sent
    )
    VALUES (
      p_customer_id,
      p_plan_name,
      p_duration_months,
      CURRENT_DATE,
      CURRENT_DATE + v_days,
      COALESCE(p_items, '[]'::jsonb),
      p_amount_paid,
      p_razorpay_payment_id,
      'active',
      false
    )
    RETURNING id INTO v_sub_id;
  END IF;

  RETURN v_sub_id;
END;
$$;

REVOKE ALL ON FUNCTION public.signup_customer(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.login_customer(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_customer_address(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_customer_dashboard(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_or_renew_customer_subscription(UUID, TEXT, INTEGER, JSONB, NUMERIC, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.signup_customer(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.login_customer(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_customer_address(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_dashboard(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_renew_customer_subscription(UUID, TEXT, INTEGER, JSONB, NUMERIC, TEXT) TO service_role;

-- 9. Helper query for scheduled 3-day expiry reminders (for cron / Edge Function)
-- SELECT cs.id, cp.email, cs.plan_name, cs.end_date
-- FROM public.customer_subscriptions cs
-- JOIN public.customer_profiles cp ON cp.id = cs.customer_id
-- WHERE cs.end_date <= CURRENT_DATE + INTERVAL '3 days'
--   AND cs.end_date >= CURRENT_DATE
--   AND cs.expiry_reminder_sent = false;
