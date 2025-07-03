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

    // In production, you should set this as a secret
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response(`Webhook signature verification failed: ${err.message}`, { 
          status: 400,
          headers: corsHeaders 
        });
      }
    } else {
      // For development - parse without verification
      event = JSON.parse(body);
      logStep("Webhook parsed without signature verification (development mode)");
    }

    logStep("Processing event", { type: event.type, id: event.id });

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
    return new Response(`Webhook error: ${errorMessage}`, {
      headers: corsHeaders,
      status: 500,
    });
  }
});