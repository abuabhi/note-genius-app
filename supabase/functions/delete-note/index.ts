
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { noteId } = await req.json();
    console.log("Edge function delete-note - Received ID:", noteId);
    
    if (!noteId) {
      console.error("Edge function delete-note - No note ID provided");
      return new Response(
        JSON.stringify({ error: "Note ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get authorization from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Edge function delete-note - No authorization header");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Set auth token for the client
    supabase.auth.setAuth(authHeader.replace("Bearer ", ""));
    
    console.log("Edge function delete-note - Starting deletion process");
    
    // First check if any note enrichment usage entries exist for this note
    const { data: enrichmentData, error: enrichmentError } = await supabase
      .from("note_enrichment_usage")
      .select("id")
      .eq("note_id", noteId);
    
    if (enrichmentError) {
      console.error("Edge function delete-note - Error checking enrichment usage:", enrichmentError);
    } else if (enrichmentData && enrichmentData.length > 0) {
      console.log(`Edge function delete-note - Found ${enrichmentData.length} enrichment usage entries to delete`);
      
      // Delete note enrichment usage entries first
      const { error: deleteEnrichmentError } = await supabase
        .from("note_enrichment_usage")
        .delete()
        .eq("note_id", noteId);
      
      if (deleteEnrichmentError) {
        console.error("Edge function delete-note - Error deleting enrichment usage:", deleteEnrichmentError);
        // Continue with other deletions even if this fails
      }
    }
    
    // Delete note tags
    const { error: tagError } = await supabase
      .from("note_tags")
      .delete()
      .eq("note_id", noteId);
    
    if (tagError) {
      console.error("Edge function delete-note - Error deleting note tags:", tagError);
      // Continue with other deletions even if this fails
    }
    
    // Delete scan data if it exists
    const { error: scanError } = await supabase
      .from("scan_data")
      .delete()
      .eq("note_id", noteId);
    
    if (scanError) {
      console.error("Edge function delete-note - Error deleting scan data:", scanError);
      // Continue with other deletions even if this fails
    }
    
    // Finally delete the note itself
    const { error: noteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);
    
    if (noteError) {
      console.error("Edge function delete-note - Error deleting note:", noteError);
      
      // If all else fails, try to use the force_delete_note database function
      try {
        console.log("Edge function delete-note - Attempting force delete via database function");
        const { data: forceDeleteData, error: forceDeleteError } = await supabase
          .rpc("force_delete_note", { note_id: noteId });
        
        if (forceDeleteError) {
          console.error("Edge function delete-note - Force delete failed:", forceDeleteError);
          throw forceDeleteError;
        }
        
        console.log("Edge function delete-note - Force delete succeeded:", forceDeleteData);
        return new Response(
          JSON.stringify({ message: "Note deleted successfully using force delete", success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (forceError) {
        console.error("Edge function delete-note - All deletion attempts failed:", forceError);
        throw noteError;
      }
    }
    
    console.log("Edge function delete-note - Note deleted successfully");
    return new Response(
      JSON.stringify({ message: "Note deleted successfully", success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Edge function delete-note - Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
