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
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!webhookSecret) {
      return jsonResponse({ error: 'Webhook secret not configured' }, 500);
    }

    const signature = req.headers.get('x-razorpay-signature') || '';
    const rawBody = await req.text();

    const isValid = await verifyHmacSha256(webhookSecret, rawBody, signature);
    if (!isValid) {
      return jsonResponse({ error: 'Invalid webhook signature' }, 401);
    }

    const event = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const paymentEntity = event?.payload?.payment?.entity;
    const rzpOrderId =
      paymentEntity?.order_id || event?.payload?.order?.entity?.id;
    const rzpPaymentId = paymentEntity?.id || null;

    if (!rzpOrderId) {
      return jsonResponse({ received: true, ignored: true });
    }

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const { data: orderRef, error } = await supabase.rpc(
        'complete_razorpay_payment',
        {
          p_razorpay_order_id: rzpOrderId,
          p_razorpay_payment_id: rzpPaymentId
        }
      );

      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      return jsonResponse({ received: true, order_ref: orderRef });
    }

    if (event.event === 'payment.failed') {
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('razorpay_order_id', rzpOrderId)
        .eq('payment_status', 'pending');

      return jsonResponse({ received: true, status: 'failed' });
    }

    return jsonResponse({ received: true });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      500
    );
  }
});
