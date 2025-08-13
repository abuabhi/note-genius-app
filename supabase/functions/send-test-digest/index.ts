
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔄 Test digest function called with method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    console.log('🔧 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasResendKey: !!resendApiKey
    });
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      throw new Error('RESEND_API_KEY not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const resend = new Resend(resendApiKey)

    // Get user from authorization header
    const authHeader = req.headers.get('authorization')
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    console.log('👤 User auth result:', { userId: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.error('❌ Invalid authorization:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's digest preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('email_digest_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('⚙️ Preferences query result:', { 
      hasPreferences: !!preferences, 
      error: prefsError?.message 
    });

    if (prefsError || !preferences) {
      console.error('❌ Email digest preferences not found:', prefsError?.message);
      return new Response(
        JSON.stringify({ error: 'Email digest preferences not found. Please configure your email preferences first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send test email by invoking the main digest template
    const testTime = new Date().toISOString()
    console.log('📧 Invoking send-digest-email for test at:', testTime)

    const payload = {
      userEmail: user.email || '',
      userId: user.id,
      reminders: [],
      goals: [],
      sessions: [],
      todos: [],
      flashcards: [],
      quizzes: [],
      timezone: preferences.timezone || 'UTC',
    }

    const { data: digestData, error: digestError } = await supabase.functions.invoke('send-digest-email', {
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    })

    if (digestError) {
      console.error('❌ send-digest-email invocation failed:', digestError)
      throw digestError
    }

    console.log('✅ Test digest sent via template:', digestData)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test digest sent via main template',
        sentTo: user.email,
        sentAt: testTime,
        emailId: (digestData as any)?.emailId ?? null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Error in send-test-digest function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send test email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
