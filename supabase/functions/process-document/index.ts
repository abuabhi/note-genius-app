
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

// Notion API client - simplified for edge function
const notionApiKey = Deno.env.get('NOTION_API_KEY');
const appleNotesApiKey = Deno.env.get('APPLE_NOTES_API_KEY');
const onenoteApiKey = Deno.env.get('ONENOTE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { fileUrl, fileType, userId, externalApiParams } = await req.json();
    
    if (!fileType) {
      return new Response(
        JSON.stringify({ error: 'File type is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Log processing request
    console.log(`Processing ${fileType} document for user: ${userId || 'anonymous'}`);
    
    let extractedText = "";
    let title = "Imported Document";
    let metadata = {};
    
    // Process local files (PDF, DOCX)
    if (fileUrl) {
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
      switch (fileType.toLowerCase()) {
        case 'pdf':
          console.log("Processing PDF document");
          const pdfResult = await readPdf(fileContent);
          extractedText = pdfResult.text;
          title = pdfResult.title || "Imported PDF";
          metadata = pdfResult.metadata || {};
          break;
          
        case 'docx':
          console.log("Processing DOCX document");
          const docxResult = await readDocx(fileContent);
          extractedText = docxResult.text;
          title = docxResult.title || "Imported Word Document";
          metadata = docxResult.metadata || {};
          break;
          
        default:
          return new Response(
            JSON.stringify({ error: 'Unsupported file type' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
      }
    }
    // Process API-based services
    else if (externalApiParams) {
      switch (fileType.toLowerCase()) {
        case 'applenotes':
          if (!appleNotesApiKey) {
            return new Response(
              JSON.stringify({ error: 'Apple Notes API key is not configured' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          console.log("Processing Apple Notes import");
          try {
            const result = await importFromAppleNotes(externalApiParams);
            extractedText = result.text;
            title = result.title || "Imported Apple Note";
            metadata = result.metadata || {};
          } catch (error) {
            console.error('Apple Notes import error:', error);
            return new Response(
              JSON.stringify({ error: `Apple Notes import failed: ${error.message}` }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          break;
          
        case 'notion':
          if (!notionApiKey) {
            return new Response(
              JSON.stringify({ error: 'Notion API key is not configured' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          console.log("Processing Notion import");
          try {
            const result = await importFromNotion(externalApiParams);
            extractedText = result.text;
            title = result.title || "Imported Notion Document";
            metadata = result.metadata || {};
          } catch (error) {
            console.error('Notion import error:', error);
            return new Response(
              JSON.stringify({ error: `Notion import failed: ${error.message}` }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          break;
          
        case 'onenote':
          if (!onenoteApiKey) {
            return new Response(
              JSON.stringify({ error: 'OneNote API key is not configured' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          console.log("Processing OneNote import");
          try {
            const result = await importFromOneNote(externalApiParams);
            extractedText = result.text;
            title = result.title || "Imported OneNote Document";
            metadata = result.metadata || {};
          } catch (error) {
            console.error('OneNote import error:', error);
            return new Response(
              JSON.stringify({ error: `OneNote import failed: ${error.message}` }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          break;
          
        default:
          return new Response(
            JSON.stringify({ error: 'Unsupported API import type' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Either fileUrl or externalApiParams must be provided' }),
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
            file_url: fileUrl || null,
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to import from Apple Notes
async function importFromAppleNotes(params: Record<string, any>): Promise<{text: string; title?: string; metadata?: Record<string, any>}> {
  // This function would use the Apple Notes API
  // Currently Apple doesn't provide a public API, but this is how it would work if they did
  try {
    // For demonstration purposes - in a real implementation you would:
    // 1. Use the params.token for authentication
    // 2. Call the hypothetical Apple Notes API
    const apiToken = params.token;
    const noteId = params.noteId;
    
    if (!apiToken || !noteId) {
      throw new Error('Missing required parameters for Apple Notes import');
    }
    
    // This would be a real API call in a production environment
    // const response = await fetch(`https://api.icloud.com/notes/${noteId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${apiToken}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    // Simulating API response for demonstration
    return {
      text: "This is the content of an imported Apple Note.\n\nCurrently Apple doesn't provide a public API for Notes, so this is a simulated import. In a real implementation, you would need to use Apple's CloudKit JS or a similar approach.",
      title: `Apple Note ${noteId}`,
      metadata: {
        source: "Apple Notes",
        importedVia: "CloudKit simulation",
        importDate: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Apple Notes import error:", error);
    throw error;
  }
}

// Function to import from Notion
async function importFromNotion(params: Record<string, any>): Promise<{text: string; title?: string; metadata?: Record<string, any>}> {
  try {
    // Extract params needed for Notion API
    const integrationToken = params.token || notionApiKey;
    const pageId = params.pageId;
    
    if (!integrationToken || !pageId) {
      throw new Error('Missing required parameters for Notion import');
    }
    
    // Make real API call to Notion
    // First, get the page
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${integrationToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });
    
    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch Notion page: ${pageResponse.statusText}`);
    }
    
    const pageData = await pageResponse.json();
    
    // Then get the page content (blocks)
    const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${integrationToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });
    
    if (!blocksResponse.ok) {
      throw new Error(`Failed to fetch Notion blocks: ${blocksResponse.statusText}`);
    }
    
    const blocksData = await blocksResponse.json();
    
    // Extract title from page properties
    let title = "Imported Notion Page";
    if (pageData.properties && pageData.properties.title) {
      const titleArray = pageData.properties.title.title;
      if (Array.isArray(titleArray) && titleArray.length > 0) {
        title = titleArray.map((t: any) => t.plain_text || "").join("");
      }
    }
    
    // Extract text content from blocks
    let textContent = "";
    if (blocksData.results && Array.isArray(blocksData.results)) {
      textContent = blocksData.results.map((block: any) => {
        // Handle different block types
        if (block.type === 'paragraph' && block.paragraph.rich_text) {
          return block.paragraph.rich_text.map((t: any) => t.plain_text || "").join("") + "\n\n";
        }
        if (block.type === 'heading_1' && block.heading_1.rich_text) {
          return "# " + block.heading_1.rich_text.map((t: any) => t.plain_text || "").join("") + "\n\n";
        }
        if (block.type === 'heading_2' && block.heading_2.rich_text) {
          return "## " + block.heading_2.rich_text.map((t: any) => t.plain_text || "").join("") + "\n\n";
        }
        if (block.type === 'heading_3' && block.heading_3.rich_text) {
          return "### " + block.heading_3.rich_text.map((t: any) => t.plain_text || "").join("") + "\n\n";
        }
        if (block.type === 'bulleted_list_item' && block.bulleted_list_item.rich_text) {
          return "• " + block.bulleted_list_item.rich_text.map((t: any) => t.plain_text || "").join("") + "\n";
        }
        if (block.type === 'numbered_list_item' && block.numbered_list_item.rich_text) {
          return "1. " + block.numbered_list_item.rich_text.map((t: any) => t.plain_text || "").join("") + "\n";
        }
        return "";
      }).join("");
    }
    
    // Collect metadata
    const metadata = {
      source: "Notion",
      pageId: pageId,
      createdTime: pageData.created_time,
      lastEditedTime: pageData.last_edited_time,
      url: pageData.url
    };
    
    return {
      text: textContent,
      title,
      metadata
    };
  } catch (error) {
    console.error("Notion import error:", error);
    throw error;
  }
}

// Function to import from OneNote
async function importFromOneNote(params: Record<string, any>): Promise<{text: string; title?: string; metadata?: Record<string, any>}> {
  try {
    // Extract params needed for Microsoft Graph API
    const accessToken = params.token || onenoteApiKey;
    const pageId = params.pageId;
    
    if (!accessToken || !pageId) {
      throw new Error('Missing required parameters for OneNote import');
    }
    
    // Make real API call to Microsoft Graph API for OneNote
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/onenote/pages/${pageId}/content`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OneNote page: ${response.statusText}`);
    }
    
    // OneNote returns the page content as HTML
    const htmlContent = await response.text();
    
    // Get page metadata
    const metadataResponse = await fetch(`https://graph.microsoft.com/v1.0/me/onenote/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch OneNote page metadata: ${metadataResponse.statusText}`);
    }
    
    const pageMetadata = await metadataResponse.json();
    
    // Extract text from HTML content
    // For a real implementation, use a proper HTML-to-text converter
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    
    // Basic text extraction
    let textContent = "";
    if (doc && doc.body) {
      // Remove script tags
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      // Get text content
      textContent = doc.body.textContent || "";
      
      // Clean up whitespace
      textContent = textContent.replace(/\s+/g, ' ').trim();
    }
    
    // Extract title
    const title = pageMetadata.title || "Imported OneNote Page";
    
    // Collect metadata
    const metadata = {
      source: "OneNote",
      pageId: pageId,
      createdDateTime: pageMetadata.createdDateTime,
      lastModifiedDateTime: pageMetadata.lastModifiedDateTime,
      notebookId: pageMetadata.parentNotebook?.id,
      notebookName: pageMetadata.parentNotebook?.displayName,
      sectionId: pageMetadata.parentSection?.id,
      sectionName: pageMetadata.parentSection?.displayName
    };
    
    return {
      text: textContent,
      title,
      metadata
    };
  } catch (error) {
    console.error("OneNote import error:", error);
    throw error;
  }
}
