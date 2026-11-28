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

    // Create/renew customer_subscriptions if this paid order is a 1-Month or 3-Month plan
    try {
      const { data: orderRow } = await supabase
        .from('orders')
        .select('id, order_ref, customer_id, customer_email, total, order_items(*)')
        .eq('order_ref', orderRef)
        .single();

      if (orderRow?.customer_id) {
        const orderItems = orderRow.order_items || [];
        const subItem = orderItems.find((it: { product_name: string }) =>
          String(it.product_name || '').includes('Subscription Plan')
        );
        const isCustomPkg =
          !subItem &&
          orderItems.some((it: { variant_label: string }) =>
            String(it.variant_label || '').includes('packs /')
          );

        if (subItem) {
          const isThreeMonth = String(subItem.product_name).includes('3-Month');
          const durationMonths = isThreeMonth ? 3 : 1;
          const planItems = [
            { name: "Cow's Milk", schedule: 'Daily' },
            { name: 'Fresh Curd', schedule: '3x / Week' },
            { name: 'Frozen Paneer', schedule: '2x / Week' },
            { name: 'Pure Desi Ghee', schedule: '1x / Month' },
            { name: 'Natural Honey', schedule: '1x / Month' }
          ];
          await supabase.rpc('create_or_renew_customer_subscription', {
            p_customer_id: orderRow.customer_id,
            p_plan_name: subItem.product_name,
            p_duration_months: durationMonths,
            p_items: planItems,
            p_amount_paid: Number(orderRow.total || subItem.line_total || 0),
            p_razorpay_payment_id: razorpay_payment_id
          });
        } else if (isCustomPkg) {
          const isThreeMo = orderItems.some((it: { variant_label: string }) =>
            String(it.variant_label || '').includes('/ 3 mo')
          );
          const pkgMonths = isThreeMo ? 3 : 1;
          await supabase.rpc('create_or_renew_customer_subscription', {
            p_customer_id: orderRow.customer_id,
            p_plan_name: pkgMonths === 3 ? 'Custom Kushi 3-Month Package' : 'Custom Kushi 1-Month Package',
            p_duration_months: pkgMonths,
            p_items: orderItems.map((it: { product_name: string; variant_label: string }) => ({
              name: it.product_name,
              schedule: it.variant_label
            })),
            p_amount_paid: Number(orderRow.total || 0),
            p_razorpay_payment_id: razorpay_payment_id
          });
        }
      }
    } catch {
      // Non-blocking: payment is already verified
    }

    return jsonResponse({ ok: true, order_ref: orderRef });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Verification failed' },
      500
    );
  }
});
