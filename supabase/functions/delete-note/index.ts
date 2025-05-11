
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

    // Delete all related records in specific order to handle all possible FK constraints

    // 1. Delete any rows in note_enrichment_usage table referencing this note
    const { error: usageError } = await supabase
      .from('note_enrichment_usage')
      .delete()
      .eq('note_id', noteId)
    
    if (usageError) {
      console.log('Warning: Error deleting note_enrichment_usage:', usageError)
    }

    // 2. Delete any associated note tags
    const { error: tagsError } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
    
    if (tagsError) {
      console.log('Warning: Error deleting note tags:', tagsError)
    }

    // 3. Delete any associated scan data
    const { error: scanError } = await supabase
      .from('scan_data')
      .delete()
      .eq('note_id', noteId)
    
    if (scanError) {
      console.log('Warning: Error deleting scan data:', scanError)
    }
    
    // 4. Check if there are any other tables that might reference notes
    // This is a more drastic approach, but it will help identify other relations
    try {
      const { data: relations } = await supabase.rpc('get_foreign_keys_to_notes')
      if (relations && relations.length > 0) {
        console.log('Found additional relations to notes table:', relations)
        // Try to delete from each related table
        for (const relation of relations) {
          const { table_name, column_name } = relation
          if (table_name && column_name && table_name !== 'notes') {
            console.log(`Attempting to delete from ${table_name} where ${column_name}=${noteId}`)
            await supabase
              .from(table_name)
              .delete()
              .eq(column_name, noteId)
          }
        }
      }
    } catch (rpcError) {
      // RPC might not exist, which is fine, we'll continue with our known relations
      console.log('Info: Could not check for additional relations:', rpcError)
    }

    // 5. Try direct SQL delete as a last resort (using service role)
    try {
      const { error: sqlError } = await supabase.rpc('force_delete_note', { note_id: noteId })
      if (sqlError) {
        console.log('Warning: Error using force delete RPC:', sqlError)
      } else {
        return new Response(
          JSON.stringify({ success: true, message: `Note ${noteId} deleted successfully via RPC` }), 
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
    } catch (rpcError) {
      console.log('Info: RPC method not available:', rpcError)
    }

    // 6. Finally try the standard delete approach
    const { error: noteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (noteError) {
      console.error('Error deleting note:', noteError)
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
