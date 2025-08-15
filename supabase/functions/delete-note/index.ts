
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
    
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseServiceRoleKey) {
      console.error("Edge function delete-note - No service role key available");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Use service role for admin-level operations
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    console.log("Edge function delete-note - Starting deletion process with service role");
    
    // Delete in the correct order to avoid foreign key constraint violations
    console.log("Edge function delete-note - Step 1: Deleting note enrichment usage entries");
    const { error: enrichmentError } = await supabase
      .from("note_enrichment_usage")
      .delete()
      .eq("note_id", noteId);
    
    if (enrichmentError) {
      console.error("Edge function delete-note - Error deleting enrichment usage:", enrichmentError);
      // Continue with deletion even if this fails
    } else {
      console.log("Edge function delete-note - Successfully deleted enrichment usage entries");
    }
    
    console.log("Edge function delete-note - Step 2: Deleting note tags");
    const { error: tagError } = await supabase
      .from("note_tags")
      .delete()
      .eq("note_id", noteId);
    
    if (tagError) {
      console.error("Edge function delete-note - Error deleting note tags:", tagError);
      // Continue with deletion even if this fails
    } else {
      console.log("Edge function delete-note - Successfully deleted note tags");
    }
    
    console.log("Edge function delete-note - Step 3: Deleting scan data");
    const { error: scanError } = await supabase
      .from("scan_data")
      .delete()
      .eq("note_id", noteId);
    
    if (scanError) {
      console.error("Edge function delete-note - Error deleting scan data:", scanError);
      // Continue with deletion even if this fails
    } else {
      console.log("Edge function delete-note - Successfully deleted scan data");
    }
    
    console.log("Edge function delete-note - Step 4: Finally deleting the note");
    const { error: noteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);
    
    if (noteError) {
      console.error("Edge function delete-note - Error deleting note:", noteError);
      
      // If regular deletion fails, try using the database function as fallback
      try {
        console.log("Edge function delete-note - Attempting force delete via database function");
        const { data: forceDeleteData, error: forceDeleteError } = await supabase
          .rpc("force_delete_note", { note_id: noteId });
        
        if (forceDeleteError) {
          console.error("Edge function delete-note - Force delete failed:", forceDeleteError);
          return new Response(
            JSON.stringify({ 
              error: "Failed to delete note", 
              details: forceDeleteError.message 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
        
        console.log("Edge function delete-note - Force delete succeeded:", forceDeleteData);
        return new Response(
          JSON.stringify({ message: "Note deleted successfully using force delete", success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (forceError) {
        console.error("Edge function delete-note - All deletion attempts failed:", forceError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to delete note", 
            details: noteError.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
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
