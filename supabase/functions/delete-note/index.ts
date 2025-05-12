
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
    // Create a Supabase client with service role key for admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the note ID from the request body
    const { noteId } = await req.json()
    
    console.log(`Attempting to force delete note with ID: ${noteId}`)
    
    if (!noteId) {
      return new Response(
        JSON.stringify({ error: 'No note ID provided' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Delete related records first to avoid foreign key constraints
    
    // 1. Delete any rows in note_enrichment_usage table referencing this note
    await supabase
      .from('note_enrichment_usage')
      .delete()
      .eq('note_id', noteId)

    // 2. Delete any associated note tags
    await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)

    // 3. Delete any associated scan data
    await supabase
      .from('scan_data')
      .delete()
      .eq('note_id', noteId)
    
    // 4. Finally delete the note itself
    const { error: noteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (noteError) {
      console.error('Error deleting note:', noteError)
      
      // If regular delete failed, attempt direct SQL delete
      try {
        // Try direct SQL delete with admin privileges
        const { error: sqlError } = await supabase.rpc('force_delete_note', { note_id: noteId })
        
        if (sqlError) {
          throw sqlError
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Note ${noteId} deleted successfully via RPC`
          }), 
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      } catch (rpcError) {
        console.error('RPC method error:', rpcError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to delete note even with admin privileges',
            details: noteError.message
          }), 
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Note ${noteId} deleted successfully` 
      }), 
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
