
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const { tier, billing, coupon_code } = await req.json();
    logStep("Request data", { tier, billing, coupon_code });

    if (!tier || !billing) {
      throw new Error("Missing tier or billing parameter");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Define pricing based on tier and billing
    let unitAmount: number;
    let productName: string;
    let interval: 'month' | 'year';

    if (tier === "GRADUATE") {
      if (billing === "monthly") {
        unitAmount = 1499; // $14.99 AUD
        productName = "Graduate Monthly";
        interval = "month";
      } else {
        unitAmount = 11992; // $119.92 AUD (20% discount from $179.88)
        productName = "Graduate Annual";
        interval = "year";
      }
    } else if (tier === "MASTER") {
      if (billing === "monthly") {
        unitAmount = 2499; // $24.99 AUD
        productName = "Master Monthly";
        interval = "month";
      } else {
        unitAmount = 19992; // $199.92 AUD (20% discount from $299.88)
        productName = "Master Annual";
        interval = "year";
      }
    } else {
      throw new Error("Invalid tier specified");
    }

    logStep("Pricing calculated", { tier, billing, unitAmount, productName, interval });

    // Handle coupon validation if provided
    let discountAmount = 0;
    let couponDetails = null;
    let finalAmount = unitAmount;

    if (coupon_code) {
      logStep("Validating coupon", { coupon_code });
      
      const { data: couponValidation, error: couponError } = await supabaseClient
        .rpc('validate_coupon', { coupon_code_param: coupon_code });

      if (couponError) {
        logStep("Coupon validation error", { error: couponError.message });
        throw new Error(`Coupon validation failed: ${couponError.message}`);
      }

      if (!couponValidation.valid) {
        logStep("Invalid coupon", { error: couponValidation.error });
        throw new Error(couponValidation.error || 'Invalid coupon');
      }

      couponDetails = couponValidation;
      
      // Calculate discount
      if (couponValidation.discount_percentage) {
        discountAmount = Math.round((unitAmount * couponValidation.discount_percentage) / 100);
      } else if (couponValidation.discount_amount) {
        discountAmount = Math.min(couponValidation.discount_amount * 100, unitAmount); // Convert to cents
      }

      finalAmount = Math.max(0, unitAmount - discountAmount);
      logStep("Coupon applied", { discountAmount, finalAmount, couponDetails });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Prepare line items
    const lineItems = [];
    
    // Main subscription item
    lineItems.push({
      price_data: {
        currency: "aud",
        product_data: { 
          name: productName,
          description: `${tier} tier access with premium features`
        },
        unit_amount: finalAmount,
        recurring: { interval },
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/settings?tab=subscription&cancelled=true`,
      metadata: {
        user_id: user.id,
        tier: tier,
        billing: billing,
        coupon_code: coupon_code || '',
        original_amount: unitAmount.toString(),
        discount_amount: discountAmount.toString(),
        influencer_id: couponDetails?.influencer_id || ''
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
