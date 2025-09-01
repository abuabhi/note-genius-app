import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create service_role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  console.log('🚀 Contact submission function called');
  
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

    const { name, email, subject, message } = await req.json();
    console.log('📧 Processing contact submission for:', email);

    // Basic validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ 
        error: 'Name, email, and message are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting check (simple IP-based)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log('🔍 Checking rate limit for IP:', clientIP);

    // Validate using existing DB function
    const { data: validation } = await supabase.rpc('validate_contact_submission', {
      p_ip_address: clientIP,
      p_email: email,
      p_message: message
    });

    if (!validation?.valid) {
      console.log('❌ Validation failed:', validation?.error);
      return new Response(JSON.stringify({ 
        error: validation?.error || 'Validation failed' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert contact submission using service_role (bypasses RLS)
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject?.trim() || null,
        message: message.trim(),
        status: 'new'
      });

    if (insertError) {
      console.error('❌ Error inserting contact submission:', insertError);
      return new Response(JSON.stringify({ 
        error: 'Failed to submit contact form' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Contact submission created successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Thank you for your message. We\'ll get back to you soon!' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Unexpected error in contact submission:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});