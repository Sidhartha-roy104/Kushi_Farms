import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

function normalizePhone(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const orderRef = String(body?.orderRef || '').trim().toUpperCase();
    const phone = normalizePhone(body?.phone);

    if (!orderRef) {
      return jsonResponse({ error: 'Order reference is required' }, 400);
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return jsonResponse(
        { error: 'Enter a valid 10-digit mobile number' },
        400
      );
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        'order_ref, status, payment_status, payment_method, subtotal, delivery_fee, total, address, created_at, order_items(product_name, variant_label, qty, unit_price, line_total)'
      )
      .eq('order_ref', orderRef)
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: 'Unable to look up order' }, 500);
    }

    if (!order) {
      return jsonResponse(
        {
          error:
            'No matching order found. Please check your Order Reference and 10-digit mobile number.'
        },
        404
      );
    }

    // Return only delivery area (landmark / pincode), never full street address
    const addr = (order.address || {}) as {
      landmark?: string;
      pincode?: string;
    };
    const deliveryArea = [addr.landmark, addr.pincode]
      .filter(Boolean)
      .join(', ');

    return jsonResponse({
      order_ref: order.order_ref,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total,
      delivery_area: deliveryArea || 'Srikakulam',
      created_at: order.created_at,
      items: order.order_items || []
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Tracking lookup failed' },
      500
    );
  }
});
