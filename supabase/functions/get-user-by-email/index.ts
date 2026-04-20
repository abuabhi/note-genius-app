import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Generic 404 helper to prevent user enumeration
  const notFound = () => new Response(
    JSON.stringify({ error: 'Not found', user: null }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )

  try {
    // 1) Require authenticated caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return notFound()
    }
    const token = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const authClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims?.sub) {
      return notFound()
    }
    const callerId = claimsData.claims.sub as string

    // 2) Restrict to DEAN-tier admins
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
    const { data: isDean, error: deanError } = await adminClient.rpc('is_dean_user', { user_id_param: callerId })
    if (deanError || !isDean) {
      return notFound()
    }

    // 3) Validate input
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
    if (!email || email.length > 320) {
      return notFound()
    }

    // 4) Look up user
    const { data, error } = await adminClient.auth.admin.listUsers()
    if (error) {
      console.error('listUsers error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = data.users.find((u) => u.email?.toLowerCase() === email)
    if (!user) return notFound()

    return new Response(
      JSON.stringify({ user: { id: user.id, email: user.email } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-user-by-email:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
