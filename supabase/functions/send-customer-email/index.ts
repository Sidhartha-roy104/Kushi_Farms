import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

function buildEmailHtml({ type, email, orderRef, items, total, startDate, endDate, planName }) {
  const header = `
    <div style="background:#092554;color:#ffffff;padding:24px 28px;border-radius:14px 14px 0 0;font-family:Arial,sans-serif;">
      <h1 style="margin:0;font-size:20px;">Kushi Dairy Products</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#cbd5e1;">Chaparam Village, Srikakulam</p>
    </div>
  `;

  if (type === 'welcome') {
    return `
      <div style="max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;color:#0a254b;">
        ${header}
        <div style="padding:24px 28px;background:#ffffff;">
          <h2 style="margin:0 0 10px;font-size:18px;">Welcome to Kushi Dairy!</h2>
          <p style="font-size:14px;line-height:1.5;color:#475569;">
            Your account (<strong>${email}</strong>) is ready. Your order receipts, subscription validity dates, and renewal reminders will be sent here.
          </p>
          <p style="font-size:13px;color:#64748b;margin-top:18px;">Need help? Call or WhatsApp +91 8464952708.</p>
        </div>
      </div>
    `;
  }

  if (type === 'expiry_reminder') {
    return `
      <div style="max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;color:#0a254b;">
        ${header}
        <div style="padding:24px 28px;background:#ffffff;">
          <h2 style="margin:0 0 10px;font-size:18px;color:#b45309;">Your ${planName || 'Kushi Plan'} is expiring soon</h2>
          <p style="font-size:14px;line-height:1.5;color:#475569;">
            Your plan ends on <strong>${endDate}</strong>. Renew in your Kushi Dashboard so your morning delivery doesn't pause.
          </p>
        </div>
      </div>
    `;
  }

  const itemRows = Array.isArray(items)
    ? items
        .map(
          (i) =>
            `<li>${i.product_name || i.name} (${i.variant_label || i.schedule || ''}) × ${i.qty || 1}</li>`
        )
        .join('')
    : '';

  return `
    <div style="max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;color:#0a254b;">
      ${header}
      <div style="padding:24px 28px;background:#ffffff;">
        <h2 style="margin:0 0 8px;font-size:18px;">Order Confirmed · ${orderRef || ''}</h2>
        ${
          startDate && endDate
            ? `<p style="font-size:13px;background:#f4fbf0;padding:10px 12px;border-radius:8px;color:#3d7719;"><strong>Subscription Validity:</strong> ${startDate} to ${endDate}</p>`
            : ''
        }
        <ul style="font-size:14px;color:#334155;padding-left:18px;">${itemRows}</ul>
        <p style="font-size:15px;font-weight:bold;margin-top:14px;">Total: ₹${Number(total || 0).toFixed(2)}</p>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const { type = 'order_confirmation', email, subject } = body || {};

    if (!email) {
      return jsonResponse({ error: 'Recipient email is required' }, 400);
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('MAIL_FROM') || 'Kushi Dairy <orders@kushifarm.com>';
    const html = buildEmailHtml(body);
    const resolvedSubject =
      subject ||
      (type === 'welcome'
        ? 'Welcome to Kushi Dairy Products!'
        : type === 'expiry_reminder'
          ? 'Renewal Reminder — Your Kushi Dairy Plan Ends Soon'
          : `Order Receipt ${body.orderRef || ''} — Kushi Dairy`);

    // Optional cron helper: run 3-day expiry reminder sweep when type === 'run_expiry_sweep'
    if (type === 'run_expiry_sweep') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const today = new Date();
      const threeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const todayStr = today.toISOString().slice(0, 10);
      const limitStr = threeDays.toISOString().slice(0, 10);

      const { data: expiring } = await supabase
        .from('customer_subscriptions')
        .select('id, plan_name, end_date, customer_profiles(email)')
        .gte('end_date', todayStr)
        .lte('end_date', limitStr)
        .eq('expiry_reminder_sent', false);

      return jsonResponse({
        ok: true,
        pendingReminders: expiring?.length || 0,
        configured: Boolean(resendKey)
      });
    }

    if (!resendKey) {
      return jsonResponse({
        ok: true,
        queued: false,
        note: 'Set RESEND_API_KEY in Supabase Edge Function secrets to enable live email delivery.'
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: resolvedSubject,
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse({ error: `Email send failed: ${errText}` }, 502);
    }

    const sent = await res.json();
    return jsonResponse({ ok: true, id: sent.id });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Email error' },
      500
    );
  }
});
