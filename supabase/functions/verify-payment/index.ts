import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { verifyHmacSha256 } from '../_shared/crypto.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeySecret) {
      return jsonResponse({ error: 'Razorpay secret not configured' }, 500);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return jsonResponse({ error: 'Missing Razorpay payment fields' }, 400);
    }

    const isValid = await verifyHmacSha256(
      razorpayKeySecret,
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature
    );

    if (!isValid) {
      return jsonResponse({ error: 'Invalid payment signature' }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: orderRef, error } = await supabase.rpc(
      'complete_razorpay_payment',
      {
        p_razorpay_order_id: razorpay_order_id,
        p_razorpay_payment_id: razorpay_payment_id
      }
    );

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    return jsonResponse({ ok: true, order_ref: orderRef });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Verification failed' },
      500
    );
  }
});
