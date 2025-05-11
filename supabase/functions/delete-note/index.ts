
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
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the note ID from the request body
    const { noteId } = await req.json()
    
    console.log(`Attempting to delete note with ID: ${noteId}`)
    
    if (!noteId) {
      return new Response(
        JSON.stringify({ error: 'No note ID provided' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Delete any associated scan data
    const { error: scanError } = await supabase
      .from('scan_data')
      .delete()
      .eq('note_id', noteId)
    
    if (scanError) {
      console.log('Warning: Error deleting scan data:', scanError)
    }

    // Delete any associated tags
    const { error: tagsError } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
    
    if (tagsError) {
      console.log('Warning: Error deleting note tags:', tagsError)
    }

    // Finally delete the note
    const { error: noteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (noteError) {
      return new Response(
        JSON.stringify({ error: noteError.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: `Note ${noteId} deleted successfully` }), 
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
