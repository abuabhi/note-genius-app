
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Setup Supabase client with the user's auth token
    supabase.auth.setAuth(authHeader.replace('Bearer ', ''))

    // Get the request body
    const { action, noteId } = await req.json()
    
    console.log(`Received action: ${action} for note: ${noteId}`)

    // Handle different actions
    if (action === 'delete') {
      // Delete the note
      if (!noteId) {
        return new Response(
          JSON.stringify({ error: 'No note ID provided' }), 
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Delete any associated scan data
      await supabase
        .from('scan_data')
        .delete()
        .eq('note_id', noteId)

      // Delete any associated tags
      await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId)

      // Finally delete the note
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Note deleted successfully' }), 
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } else if (action === 'get') {
      // Get note details
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          tags:note_tags(
            tag:tags(id, name, color)
          ),
          user_subjects(id, name)
        `)
        .eq('id', noteId)
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data }), 
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
