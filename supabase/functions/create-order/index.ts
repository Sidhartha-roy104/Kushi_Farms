import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const SUBSCRIPTION_PLANS: Record<
  string,
  { name: string; durationDays: number; price: number }
> = {
  '1-month': {
    name: '1-Month Kushi Subscription Plan',
    durationDays: 30,
    price: 2199
  },
  '3-month': {
    name: '3-Month Kushi Subscription Plan',
    durationDays: 90,
    price: 5999
  }
};

function formatIstDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
}

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
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const cart = Array.isArray(body?.cart) ? body.cart : [];
    const subscriptionPlan = body?.subscriptionPlan || null;
    const customer = body?.customer || {};
    const paymentMethod = body?.paymentMethod === 'cod' ? 'cod' : 'razorpay';

    if (!subscriptionPlan && cart.length === 0) {
      return jsonResponse({ error: 'Cart is empty' }, 400);
    }

    const customerName = String(customer.name || '').trim();
    const phone = normalizePhone(customer.phone);
    const street = String(customer.address || '').trim();
    const landmark = String(customer.landmark || '').trim();
    const pincode = String(customer.pincode || '').trim();

    if (!customerName) {
      return jsonResponse({ error: 'Customer name is required' }, 400);
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return jsonResponse({ error: 'Enter a valid 10-digit mobile number' }, 400);
    }
    if (!street) {
      return jsonResponse({ error: 'Delivery address is required' }, 400);
    }
    if (!/^[0-9]{6}$/.test(pincode)) {
      return jsonResponse({ error: 'Enter a valid 6-digit pincode' }, 400);
    }

    // 1. Load store settings from DB
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError || !settings) {
      return jsonResponse({ error: 'Store settings unavailable' }, 500);
    }

    // Validate pincode against serviceable_pincodes
    const serviceable: string[] = settings.serviceable_pincodes || [];
    if (serviceable.length > 0 && !serviceable.includes(pincode)) {
      return jsonResponse(
        { error: `Sorry, we do not deliver to pincode ${pincode} yet.` },
        400
      );
    }

    if (paymentMethod === 'cod' && !settings.cod_enabled) {
      return jsonResponse(
        { error: 'Cash on Delivery is currently disabled.' },
        400
      );
    }

    // 2. Build order items & compute authoritative totals
    let subtotal = 0;
    let deliveryFee = 0;
    const orderItemsPayload: Array<{
      variant_id: string | null;
      product_name: string;
      variant_label: string;
      qty: number;
      unit_price: number;
      line_total: number;
    }> = [];

    if (subscriptionPlan) {
      const plan = SUBSCRIPTION_PLANS[String(subscriptionPlan.planId || '')];
      if (!plan) {
        return jsonResponse({ error: 'Invalid subscription plan' }, 400);
      }

      const start = new Date();
      const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      const slot = String(subscriptionPlan.dailySlot || 'Morning (06:30–08:30 AM)').trim();
      const validityLabel = `${plan.durationDays} Days (${formatIstDate(start)} – ${formatIstDate(end)}) · ${slot}`;

      subtotal = plan.price;
      deliveryFee = 0;

      orderItemsPayload.push({
        variant_id: null,
        product_name: plan.name,
        variant_label: validityLabel,
        qty: 1,
        unit_price: plan.price,
        line_total: plan.price
      });
    } else {
      const variantIds = [...new Set(cart.map((c: { variantId: string }) => c.variantId).filter(Boolean))];
      if (variantIds.length !== cart.length) {
        return jsonResponse({ error: 'Invalid cart item' }, 400);
      }

      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id, label, price, stock, is_active, products(id, name, is_active)')
        .in('id', variantIds);

      if (variantsError || !variants) {
        return jsonResponse({ error: 'Failed to load products' }, 500);
      }

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      for (const item of cart) {
        const qty = Number(item.qty);
        if (!Number.isInteger(qty) || qty <= 0) {
          return jsonResponse({ error: 'Invalid item quantity' }, 400);
        }

        const v = variantMap.get(item.variantId);
        const prod = Array.isArray(v?.products) ? v.products[0] : v?.products;

        if (!v || !v.is_active || !prod || !prod.is_active) {
          return jsonResponse({ error: 'One or more selected products are unavailable' }, 400);
        }

        if (v.stock < qty) {
          return jsonResponse(
            { error: `Insufficient stock for ${prod.name} (${v.label}). Available: ${v.stock}` },
            400
          );
        }

        const unitPrice = Number(v.price);
        const lineTotal = Number((unitPrice * qty).toFixed(2));
        subtotal = Number((subtotal + lineTotal).toFixed(2));

        orderItemsPayload.push({
          variant_id: v.id,
          product_name: prod.name,
          variant_label: v.label,
          qty,
          unit_price: unitPrice,
          line_total: lineTotal
        });
      }

      const threshold = Number(settings.free_delivery_threshold ?? 199);
      const fee = Number(settings.delivery_fee ?? 20);
      deliveryFee = subtotal >= threshold ? 0 : fee;
    }

    const total = Number((subtotal + deliveryFee).toFixed(2));

    // 3. Create order row
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        phone,
        address: { street, landmark, pincode },
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'placed'
      })
      .select('id, order_ref, total')
      .single();

    if (orderError || !order) {
      return jsonResponse({ error: 'Could not create order' }, 500);
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      return jsonResponse({ error: 'Could not save order items' }, 500);
    }

    // 4. Handle COD vs Razorpay
    if (paymentMethod === 'cod') {
      const { error: stockErr } = await supabase.rpc('decrement_order_stock', {
        p_order_id: order.id
      });
      if (stockErr) {
        await supabase.from('orders').delete().eq('id', order.id);
        return jsonResponse({ error: stockErr.message }, 400);
      }
      return jsonResponse({
        payment_method: 'cod',
        order_ref: order.order_ref,
        amount: Math.round(total * 100),
        currency: 'INR'
      });
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return jsonResponse(
        { error: 'Razorpay credentials are not configured on the server' },
        500
      );
    }

    const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // paise
        currency: 'INR',
        receipt: order.order_ref,
        notes: {
          order_ref: order.order_ref,
          phone
        }
      })
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      await supabase.from('orders').delete().eq('id', order.id);
      return jsonResponse(
        { error: `Razorpay order creation failed: ${errText}` },
        502
      );
    }

    const rzpOrder = await rzpRes.json();

    await supabase
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', order.id);

    return jsonResponse({
      payment_method: 'razorpay',
      razorpay_order_id: rzpOrder.id,
      order_ref: order.order_ref,
      key_id: razorpayKeyId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unexpected server error' },
      500
    );
  }
});
