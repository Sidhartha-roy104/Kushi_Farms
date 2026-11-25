import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    // Verify caller identity using their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const {
      data: { user },
      error: userErr
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Confirm user is in public.admins
    const { data: adminRow } = await adminClient
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminRow) {
      return jsonResponse({ error: 'Forbidden: admin access required' }, 403);
    }

    const body = await req.json();
    const orderId = body?.orderId;
    if (!orderId) {
      return jsonResponse({ error: 'orderId is required' }, 400);
    }

    const { data: invRows, error: invErr } = await adminClient.rpc(
      'assign_invoice_number',
      { p_order_id: orderId }
    );

    if (invErr || !invRows || invRows.length === 0) {
      return jsonResponse(
        { error: invErr?.message || 'Could not assign invoice number' },
        400
      );
    }

    const assigned = invRows[0];

    const { data: order, error: orderErr } = await adminClient
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return jsonResponse({ error: 'Order not found' }, 404);
    }

    const { data: settings } = await adminClient
      .from('settings')
      .select('store_name, phone, whatsapp_number')
      .eq('id', 1)
      .maybeSingle();

    return jsonResponse({
      invoice_number: assigned.invoice_number,
      invoice_generated_at: assigned.invoice_generated_at,
      order,
      settings: settings || {
        store_name: 'Kushi Dairy Products',
        phone: '8464952708'
      }
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Invoice generation failed' },
      500
    );
  }
});
