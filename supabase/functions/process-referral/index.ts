import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create service_role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  console.log('🚀 Process referral function called');
  
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

    const { referred_user_id, referral_code_used } = await req.json();
    console.log('👥 Processing referral for user:', referred_user_id, 'with code:', referral_code_used);

    // Validation
    if (!referred_user_id || !referral_code_used) {
      return new Response(JSON.stringify({ 
        error: 'referred_user_id and referral_code_used are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 Finding referrer profile...');

    // Find referrer by code
    const { data: referrerProfile, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referral_code')
      .eq('referral_code', referral_code_used)
      .neq('id', referred_user_id) // Can't refer yourself
      .single();

    if (referrerError || !referrerProfile) {
      console.log('❌ Invalid referral code:', referral_code_used);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid referral code'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Found referrer:', referrerProfile.id);

    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', referred_user_id)
      .single();

    if (existingReferral) {
      console.log('⚠️ Referral already exists for user:', referred_user_id);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'User already has a referral record'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📝 Creating referral record...');

    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerProfile.id,
        referred_user_id: referred_user_id,
        referral_code: referral_code_used,
        status: 'completed',
        points_awarded: 100
      });

    if (referralError) {
      console.error('❌ Error creating referral:', referralError);
      throw referralError;
    }

    console.log('🏆 Updating contest entries...');

    // Update contest entries for active contests
    const { error: contestError } = await supabase
      .rpc('sql', {
        query: `
          UPDATE contest_entries 
          SET 
            referrals_count = referrals_count + 1,
            is_eligible = (referrals_count + 1) >= (
              SELECT min_referrals_required 
              FROM contests 
              WHERE id = contest_entries.contest_id
            ),
            updated_at = now()
          WHERE user_id = $1
          AND contest_id IN (
            SELECT id FROM contests 
            WHERE is_active = true 
            AND start_date <= now() 
            AND end_date >= now()
          )
        `,
        params: [referrerProfile.id]
      });

    if (contestError) {
      console.error('⚠️ Warning: Could not update contest entries:', contestError);
      // Don't fail the whole operation for this
    }

    console.log('✅ Referral processed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      referrer_id: referrerProfile.id,
      points_awarded: 100
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error processing referral:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to process referral'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});