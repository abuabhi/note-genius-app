import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

// Helper to log consistently
const log = (msg: string, data?: unknown) => {
  console.log(`[admin-stripe-metrics] ${msg}${data ? ` | ${JSON.stringify(data)}` : ""}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    log("Authenticated user", { userId: user.id, email: user.email });

    // Enforce DEAN access using SECURITY DEFINER RPC
    const { data: isDean, error: deanErr } = await adminClient.rpc("is_dean_user", { user_id_param: user.id });
    if (deanErr) {
      log("Error checking dean status", deanErr);
      return new Response(JSON.stringify({ error: "Access check failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!isDean) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Parse incoming body for date range
    let start: Date, end: Date;
    try {
      const body = (await req.json().catch(() => ({}))) as { start?: string; end?: string };
      start = body?.start ? new Date(body.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      end = body?.end ? new Date(body.end) : new Date();
    } catch (_) {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      end = new Date();
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Fetch active subscriptions (approx for MRR/ARR & plan distribution)
    const activeSubs = await stripe.subscriptions.list({ status: "active", limit: 100 });

    let mrrCents = 0;
    const planMap: Record<string, { plan: string; customers: number; revenueCents: number }> = {};

    for (const sub of activeSubs.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        const interval = price.recurring?.interval;
        const amount = (price.unit_amount ?? 0) * (item.quantity ?? 1);
        let monthlyAmount = 0;
        if (interval === "month") monthlyAmount = amount;
        else if (interval === "year") monthlyAmount = Math.round(amount / 12);
        else monthlyAmount = 0; // unsupported intervals treated as 0

        mrrCents += monthlyAmount;

        const planName = price.nickname || (typeof price.product === "string" ? price.product : price.id);
        if (!planMap[planName]) planMap[planName] = { plan: planName, customers: 0, revenueCents: 0 };
        planMap[planName].customers += 1;
        planMap[planName].revenueCents += monthlyAmount;
      }
    }

    const arrCents = mrrCents * 12;

    // Churn approximation: canceled in window / (active + canceled in window)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const canceledSubs = await stripe.subscriptions.list({ status: "canceled", limit: 100 });
    const canceledInWindow = canceledSubs.data.filter((s) => (s.canceled_at ?? 0) * 1000 >= thirtyDaysAgo.getTime());
    const churnDenominator = activeSubs.data.length + canceledInWindow.length;
    const churnRate = churnDenominator > 0 ? (canceledInWindow.length / churnDenominator) * 100 : 0;

    // MRR history via paid invoices grouped by month within range
    const invoices = await stripe.invoices.list({ status: "paid", limit: 100, created: { gte: Math.floor(start.getTime() / 1000), lte: Math.floor(end.getTime() / 1000) } });
    const byMonth: Record<string, number> = {};
    for (const inv of invoices.data) {
      const created = new Date((inv.created ?? 0) * 1000);
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] ?? 0) + (inv.amount_paid ?? 0);
    }
    const mrrHistory = Object.entries(byMonth)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, cents]) => ({ month, mrr: Math.round((cents as number) / 100) }));

    const planDistribution = Object.values(planMap).map((p) => ({ plan: p.plan, customers: p.customers, revenue: Math.round(p.revenueCents / 100) }));

    const result = {
      mrr: Math.round(mrrCents / 100),
      arr: Math.round(arrCents / 100),
      churnRate: Number(churnRate.toFixed(2)),
      mrrHistory,
      planDistribution,
      cac: 0,
      ltv: 0,
      ltvCacRatio: 0,
      range: { start: start.toISOString(), end: end.toISOString() },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    log("ERROR", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
