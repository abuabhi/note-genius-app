import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the requesting user is a DEAN
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Check if user is DEAN
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_tier')
      .eq('id', user.id)
      .single();

    if (profile?.user_tier !== 'DEAN') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    // Fetch all users from auth.users with their profiles
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response('Error fetching users', { status: 500, headers: corsHeaders });
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response('Error fetching profiles', { status: 500, headers: corsHeaders });
    }

    // Combine auth users with their profiles
    const usersWithProfiles = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        username: profile?.username || null,
        first_name: profile?.first_name || null,
        user_tier: profile?.user_tier || 'SCHOLAR',
        created_at: authUser.created_at,
        onboarding_completed: profile?.onboarding_completed || false,
        is_influencer: profile?.is_influencer || false,
        influencer_tier: profile?.influencer_tier || null,
        influencer_metadata: profile?.influencer_metadata || null,
        influencer_promoted_at: profile?.influencer_promoted_at || null,
        influencer_promoted_by: profile?.influencer_promoted_by || null,
        influencer_expires_at: profile?.influencer_expires_at || null,
        influencer_notes: profile?.influencer_notes || null
      };
    });

    return new Response(JSON.stringify(usersWithProfiles), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-admin-users function:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});