import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    // Signature verification is MANDATORY — no fallback to unverified parsing
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("STRIPE_WEBHOOK_SECRET is not configured");
      return new Response("Webhook secret not configured", {
        status: 500,
        headers: corsHeaders,
      });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified");
    } catch (err) {
      logStep("Webhook signature verification failed");
      return new Response("Invalid signature", {
        status: 400,
        headers: corsHeaders,
      });
    }

    logStep("Processing event", { type: event.type, id: event.id });

    // ===== Subscription lifecycle handlers =====
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("Subscription upserted", { id: subscription.id, status: subscription.status });

      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const email = customer.email;

      if (email) {
        const priceId = subscription.items.data[0]?.price.id;
        const amount = subscription.items.data[0]?.price.unit_amount || 0;

        const { error } = await supabaseClient
          .from("mock_subscriptions")
          .upsert({
            user_id: null,
            plan_name: priceId || "unknown",
            mrr_amount: amount / 100,
            status: subscription.status,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (error) logStep("Failed to upsert subscription", { error });
        else logStep("Subscription synced", { email, status: subscription.status });
      }

      return new Response("Subscription updated", { status: 200, headers: corsHeaders });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("Subscription cancelled", { id: subscription.id });

      const { error } = await supabaseClient
        .from("mock_subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("plan_name", subscription.items.data[0]?.price.id || "");

      if (error) logStep("Failed to mark subscription cancelled", { error });
      return new Response("Subscription cancelled", { status: 200, headers: corsHeaders });
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      logStep("Payment failed", {
        id: invoice.id,
        customer: invoice.customer,
        amount_due: invoice.amount_due,
        attempt_count: invoice.attempt_count,
      });
      // Optional: notify user via email or flag account here
      return new Response("Payment failure logged", { status: 200, headers: corsHeaders });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout.session.completed", { sessionId: session.id });

      const metadata = session.metadata;
      if (!metadata || !metadata.coupon_code || !metadata.influencer_id) {
        logStep("No coupon data in session metadata, skipping");
        return new Response("No coupon data found", { 
          status: 200,
          headers: corsHeaders 
        });
      }

      const {
        user_id,
        tier,
        billing,
        coupon_code,
        original_amount,
        discount_amount,
        influencer_id
      } = metadata;

      logStep("Session metadata", metadata);

      // Calculate commission (10% default)
      const commissionRate = 0.10;
      const orderAmount = parseInt(original_amount) / 100; // Convert from cents
      const discountValue = parseInt(discount_amount) / 100; // Convert from cents
      const commissionAmount = orderAmount * commissionRate;

      // Get customer email from session
      const customerEmail = session.customer_email || session.customer_details?.email;

      // Record the order in influencer_orders table
      const { error: orderError } = await supabaseClient
        .from('influencer_orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: customerEmail,
          influencer_id: influencer_id,
          coupon_code: coupon_code,
          order_amount: orderAmount,
          discount_amount: discountValue,
          commission_amount: commissionAmount,
          commission_rate: commissionRate,
          status: 'completed',
          processed_at: new Date().toISOString()
        });

      if (orderError) {
        logStep("Failed to record order", { error: orderError });
        throw orderError;
      }

      logStep("Order recorded successfully", {
        sessionId: session.id,
        orderAmount,
        commissionAmount,
        couponCode: coupon_code
      });

      // Update coupon usage count
      const { data: currentCoupon, error: fetchError } = await supabaseClient
        .from('influencer_coupons')
        .select('current_usage')
        .eq('coupon_code', coupon_code)
        .single();

      if (fetchError) {
        logStep("Failed to fetch coupon", { error: fetchError });
        throw fetchError;
      }

      const { error: couponError } = await supabaseClient
        .from('influencer_coupons')
        .update({ 
          current_usage: (currentCoupon.current_usage || 0) + 1
        })
        .eq('coupon_code', coupon_code);

      if (couponError) {
        logStep("Failed to update coupon usage", { error: couponError });
        throw couponError;
      }

      logStep("Coupon usage updated successfully");

      // Record in coupon_usage table for analytics
      const { error: usageError } = await supabaseClient
        .from('coupon_usage')
        .insert({
          coupon_code: coupon_code,
          user_id: user_id || null,
          influencer_id: influencer_id,
          order_value: orderAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          status: 'active'
        });

      if (usageError) {
        logStep("Failed to record coupon usage", { error: usageError });
        // Don't throw here as main order is already recorded
      }

      logStep("Webhook processing completed successfully");
    }

    return new Response("Webhook processed successfully", { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response("Webhook processing error", {
      headers: corsHeaders,
      status: 500,
    });
  }
});