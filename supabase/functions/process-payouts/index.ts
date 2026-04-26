import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYOUTS] ${step}${detailsStr}`);
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
    logStep("Starting payout processing");

    // Get all influencers with pending commissions
    const { data: pendingPayouts, error: payoutError } = await (supabaseClient as any)
      .from('influencer_orders')
      .select(`
        influencer_id,
        profiles!inner(username, email),
        sum(commission_amount) as total_commission,
        count(*) as order_count
      `)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .group('influencer_id, profiles.username, profiles.email')
      .having('sum(commission_amount)', 'gte', 50); // Minimum $50 payout

    if (payoutError) {
      logStep("Failed to fetch pending payouts", { error: payoutError });
      throw payoutError;
    }

    if (!pendingPayouts || pendingPayouts.length === 0) {
      logStep("No pending payouts found");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No payouts to process",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found pending payouts", { count: pendingPayouts.length });

    let processedCount = 0;
    const results = [];

    for (const payout of pendingPayouts) {
      try {
        // Check if payout already exists for this period
        const { data: existingPayout } = await supabaseClient
          .from('influencer_payouts')
          .select('id')
          .eq('influencer_id', payout.influencer_id)
          .eq('status', 'pending')
          .single();

        if (existingPayout) {
          logStep("Payout already exists", { influencerId: payout.influencer_id });
          continue;
        }

        // Create payout record
        const { error: insertError } = await supabaseClient
          .from('influencer_payouts')
          .insert({
            influencer_id: payout.influencer_id,
            amount: payout.total_commission,
            currency: 'USD',
            status: 'pending',
            period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            period_end: new Date().toISOString(),
            orders_count: payout.order_count,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          logStep("Failed to create payout", { 
            error: insertError, 
            influencerId: payout.influencer_id 
          });
          results.push({
            influencer_id: payout.influencer_id,
            success: false,
            error: insertError.message
          });
          continue;
        }

        processedCount++;
        results.push({
          influencer_id: payout.influencer_id,
          username: payout.profiles.username,
          amount: payout.total_commission,
          orders: payout.order_count,
          success: true
        });

        logStep("Payout created successfully", {
          influencerId: payout.influencer_id,
          amount: payout.total_commission,
          orders: payout.order_count
        });

      } catch (error) {
        logStep("Error processing individual payout", { 
        error: (error as Error)?.message ?? String(error),
          influencerId: payout.influencer_id 
        });
        results.push({
          influencer_id: payout.influencer_id,
          success: false,
          error: (error as Error)?.message ?? String(error)
        });
      }
    }

    logStep("Payout processing completed", { 
      total: pendingPayouts.length,
      processed: processedCount 
    });

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      total: pendingPayouts.length,
      results: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-payouts", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});