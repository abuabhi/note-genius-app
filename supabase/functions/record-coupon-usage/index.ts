import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create service_role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CouponUsageParams {
  stripe_session_id: string;
  customer_email: string;
  influencer_id: string;
  coupon_code: string;
  order_amount: number;
  discount_amount: number;
  commission_amount: number;
  commission_rate: number;
}

Deno.serve(async (req) => {
  console.log('🚀 Record coupon usage function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params: CouponUsageParams = await req.json();
    console.log('📊 Processing coupon usage for:', params.coupon_code);

    // Validation
    const requiredFields = [
      'stripe_session_id', 'customer_email', 'influencer_id', 
      'coupon_code', 'order_amount', 'discount_amount', 
      'commission_amount', 'commission_rate'
    ];

    for (const field of requiredFields) {
      if (!(field in params) || params[field as keyof CouponUsageParams] === null || params[field as keyof CouponUsageParams] === undefined) {
        return new Response(JSON.stringify({ 
          error: `Missing required field: ${field}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Begin transaction-like operations
    console.log('💳 Recording influencer order...');
    
    // Record the order
    const { error: orderError } = await supabase
      .from('influencer_orders')
      .insert({
        stripe_session_id: params.stripe_session_id,
        customer_email: params.customer_email,
        influencer_id: params.influencer_id,
        coupon_code: params.coupon_code,
        order_amount: params.order_amount,
        discount_amount: params.discount_amount,
        commission_amount: params.commission_amount,
        commission_rate: params.commission_rate,
        status: 'completed',
        processed_at: new Date().toISOString()
      });

    if (orderError) {
      console.error('❌ Error recording order:', orderError);
      throw orderError;
    }

    console.log('📈 Updating coupon usage count...');

    // Update coupon usage count
    const { data: currentCoupon, error: fetchError } = await supabase
      .from('influencer_coupons')
      .select('current_usage')
      .eq('coupon_code', params.coupon_code)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching coupon:', fetchError);
      throw fetchError;
    }

    const { error: couponError } = await supabase
      .from('influencer_coupons')
      .update({ 
        current_usage: (currentCoupon.current_usage || 0) + 1
      })
      .eq('coupon_code', params.coupon_code);

    if (couponError) {
      console.error('❌ Error updating coupon usage:', couponError);
      throw couponError;
    }

    console.log('📊 Recording usage analytics...');

    // Record in coupon_usage table for analytics
    const { error: usageError } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_code: params.coupon_code,
        user_id: null, // Customer not necessarily a user
        influencer_id: params.influencer_id,
        order_value: params.order_amount,
        commission_rate: params.commission_rate,
        commission_amount: params.commission_amount,
        status: 'active'
      });

    if (usageError) {
      console.error('❌ Error recording usage analytics:', usageError);
      throw usageError;
    }

    console.log('✅ Coupon usage recorded successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Coupon usage recorded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error recording coupon usage:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to record coupon usage',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});