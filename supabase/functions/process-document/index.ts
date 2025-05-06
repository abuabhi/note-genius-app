
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { readPdf } from './pdf-reader.ts';
import { readDocx } from './docx-reader.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Supabase URL and key from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Supabase client with the service role key for admin rights
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { fileUrl, fileType, userId } = await req.json();
    
    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: 'File URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    if (!fileType) {
      return new Response(
        JSON.stringify({ error: 'File type is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Log processing request
    console.log(`Processing ${fileType} document for user: ${userId || 'anonymous'}`);
    
    // Download the file from the URL
    let fileContent;
    try {
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
      }
      fileContent = await fileResponse.arrayBuffer();
    } catch (fetchError) {
      console.error('Error fetching document:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch document' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Process the document based on file type
    let extractedText = "";
    let title = "Imported Document";
    let metadata = {};
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        const pdfResult = await readPdf(fileContent);
        extractedText = pdfResult.text;
        title = pdfResult.title || "Imported PDF";
        metadata = pdfResult.metadata || {};
        break;
        
      case 'docx':
        const docxResult = await readDocx(fileContent);
        extractedText = docxResult.text;
        title = docxResult.title || "Imported Word Document";
        metadata = docxResult.metadata || {};
        break;
        
      case 'applenotes':
        // Simple text extraction for Apple Notes
        extractedText = "This is simulated Apple Notes content. In a full implementation, we would parse the Apple Notes format.";
        title = "Imported Apple Note";
        break;
        
      case 'notion':
        // Simple text extraction for Notion
        extractedText = "This is simulated Notion content. In a full implementation, we would use the Notion API to fetch content.";
        title = "Imported Notion Document";
        break;
        
      case 'onenote':
        // Simple text extraction for OneNote
        extractedText = "This is simulated OneNote content. In a full implementation, we would use the OneNote API to fetch content.";
        title = "Imported OneNote Document";
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported file type' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }
    
    // Log successful processing
    console.log(`Document processing completed for ${fileType} with title: ${title}`);
    
    // If userId is provided, we could log this activity to a processing_logs table
    if (userId) {
      try {
        const { error } = await supabase
          .from('processing_logs')
          .insert({
            user_id: userId,
            file_url: fileUrl,
            file_type: fileType,
            processed_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error logging processing activity:', error);
        }
      } catch (logError) {
        // Don't fail the main operation if logging fails
        console.error('Failed to log processing activity:', logError);
      }
    }
    
    return new Response(
      JSON.stringify({
        text: extractedText,
        title: title,
        metadata: metadata,
        processedAt: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
