
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
    
    console.log(`Attempting to delete note with ID: ${noteId}`)
    
    if (!noteId) {
      return new Response(
        JSON.stringify({ error: 'No note ID provided' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Debug info - check if the note exists first and log all its data
    const { data: noteCheck, error: noteCheckError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (noteCheckError) {
      console.log(`Note check error for ID ${noteId}:`, noteCheckError)
    } else {
      console.log(`Found note to delete:`, noteCheck)
    }

    // Delete related records first to avoid foreign key constraints - WITH ERROR HANDLING FOR EACH STEP
    
    // 1. Delete any rows in note_enrichment_usage table referencing this note
    const { error: usageError } = await supabase
      .from('note_enrichment_usage')
      .delete()
      .eq('note_id', noteId)

    if (usageError) {
      console.log(`Warning: Error deleting from note_enrichment_usage:`, usageError)
      // Continue anyway - don't break the delete process
    }

    // 2. Delete any associated note tags
    const { error: tagsError } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)

    if (tagsError) {
      console.log(`Warning: Error deleting from note_tags:`, tagsError)
      // Continue anyway
    }

    // 3. Delete any associated scan data
    const { error: scanError } = await supabase
      .from('scan_data')
      .delete()
      .eq('note_id', noteId)
    
    if (scanError) {
      console.log(`Warning: Error deleting from scan_data:`, scanError)
      // Continue anyway
    }
    
    // 4. Finally delete the note itself
    const { error: noteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (noteError) {
      console.error('Error deleting note:', noteError)
      
      // If regular delete failed, attempt direct SQL delete via RPC
      try {
        console.log("Attempting force delete via direct SQL query")
        
        // Use raw SQL query to force delete the note (bypassing constraints)
        const { data: sqlData, error: sqlError } = await supabase.rpc('force_delete_note', {
          note_id: noteId
        })
        
        if (sqlError) {
          throw sqlError
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Note ${noteId} deleted successfully via direct SQL` 
          }), 
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      } catch (forceError) {
        console.error('Force delete error:', forceError)
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to delete note even with admin privileges',
            details: noteError.message,
            forceError: forceError.message
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
      JSON.stringify({ 
        error: 'Unexpected error during note deletion',
        details: error.message
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
