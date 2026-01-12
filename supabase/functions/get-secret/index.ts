import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // SECURITY: Get and verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Check if user is DEAN tier (only DEAN users can access secrets)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.user_tier !== 'DEAN') {
      console.error('Authorization failed: User is not DEAN tier', { userId: user.id, tier: profile?.user_tier });
      return new Response(
        JSON.stringify({ error: 'Access denied: insufficient privileges' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { secretName } = await req.json();
    
    if (!secretName) {
      return new Response(
        JSON.stringify({ error: 'Secret name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Log access attempt for audit
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: 'SECRET_ACCESS',
        table_name: 'secrets',
        success: true,
        error_message: `Accessed secret: ${secretName}`
      })
      .then(() => console.log(`Secret access logged for user ${user.id}: ${secretName}`))
      .catch(err => console.error('Failed to log secret access:', err));

    // SECURITY: Whitelist allowed secret names
    const allowedSecrets = [
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY', 
      'STRIPE_WEBHOOK_SECRET',
      'GOOGLE_CLIENT_SECRET',
      'MICROSOFT_CLIENT_SECRET',
      'SENTRY_DSN'
    ];

    if (!allowedSecrets.includes(secretName)) {
      console.error('Unauthorized secret access attempt:', { secretName, userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Access to this secret is not permitted' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the secret from environment variables
    const secretValue = Deno.env.get(secretName);
    
    if (!secretValue) {
      return new Response(
        JSON.stringify({ error: `Secret ${secretName} not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ value: secretValue }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-secret function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});