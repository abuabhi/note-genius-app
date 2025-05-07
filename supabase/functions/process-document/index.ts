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

// API keys for external services
const notionApiKey = Deno.env.get('NOTION_API_KEY');
const onenoteApiKey = Deno.env.get('ONENOTE_API_KEY');
const evernoteApiKey = Deno.env.get('EVERNOTE_API_KEY');
const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

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
        case 'notion':
          if (!notionApiKey && !externalApiParams.token) {
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
          if (!onenoteApiKey && !externalApiParams.token) {
            return new Response(
              JSON.stringify({ error: 'OneNote access token is not provided' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          console.log("Processing OneNote import with OAuth token");
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

        case 'evernote':
          if (!evernoteApiKey && !externalApiParams.token) {
            return new Response(
              JSON.stringify({ error: 'Evernote API key is not configured' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          console.log("Processing Evernote import");
          try {
            const result = await importFromEvernote(externalApiParams);
            extractedText = result.text;
            title = result.title || "Imported Evernote Note";
            metadata = result.metadata || {};
          } catch (error) {
            console.error('Evernote import error:', error);
            return new Response(
              JSON.stringify({ error: `Evernote import failed: ${error.message}` }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          break;

        case 'googledocs':
          if (!googleApiKey && !externalApiParams.token) {
            return new Response(
              JSON.stringify({ error: 'Google API key is not configured' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          console.log("Processing Google Docs import");
          try {
            const result = await importFromGoogleDocs(externalApiParams);
            extractedText = result.text;
            title = result.title || "Imported Google Document";
            metadata = result.metadata || {};
          } catch (error) {
            console.error('Google Docs import error:', error);
            return new Response(
              JSON.stringify({ error: `Google Docs import failed: ${error.message}` }),
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
    
    console.log("Making API call to Microsoft Graph for OneNote page");
    
    // Make real API call to Microsoft Graph API for OneNote
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/onenote/pages/${pageId}/content`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch OneNote page: ${response.status} ${response.statusText}`, errorText);
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
      console.error(`Failed to fetch OneNote metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
      throw new Error(`Failed to fetch OneNote page metadata: ${metadataResponse.statusText}`);
    }
    
    const pageMetadata = await metadataResponse.json();
    
    // Extract text from HTML content using a simple approach
    // In a production environment, use a proper HTML parser
    let textContent = "";
    try {
      // Create a new DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      
      if (doc && doc.body) {
        // Remove script tags
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Get text content
        textContent = doc.body.textContent || "";
        
        // Clean up whitespace
        textContent = textContent.replace(/\s+/g, ' ').trim();
      }
    } catch (parseError) {
      console.error("Error parsing HTML:", parseError);
      // Fallback: basic HTML tag removal
      textContent = htmlContent
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ')     // Replace multiple whitespace with single space
        .trim();
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
    
    console.log(`Successfully processed OneNote page: ${title}`);
    
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

// Function to import from Evernote
async function importFromEvernote(params: Record<string, any>): Promise<{text: string; title?: string; metadata?: Record<string, any>}> {
  try {
    const token = params.token || evernoteApiKey;
    const noteGuid = params.noteGuid;
    
    if (!token || !noteGuid) {
      throw new Error('Missing required parameters for Evernote import');
    }
    
    // Evernote API requires OAuth and their SDK, so this is a simplified example
    // In a real implementation, you'd use the Evernote SDK
    const response = await fetch(`https://api.evernote.com/v1/notes/${noteGuid}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Evernote note: ${response.statusText}`);
    }
    
    const noteData = await response.json();
    
    // Evernote notes are in ENML format, so we'd need to convert that to plain text
    // Here's a simplified representation:
    const title = noteData.title || "Imported Evernote Note";
    const content = noteData.content || "";
    
    // In a real implementation, parse ENML to extract text
    // This is a simplified example
    const textContent = content.replace(/<[^>]*>/g, ''); // Simple HTML tag removal
    
    const metadata = {
      source: "Evernote",
      noteGuid: noteGuid,
      created: noteData.created,
      updated: noteData.updated,
      notebookGuid: noteData.notebookGuid
    };
    
    return {
      text: textContent,
      title,
      metadata
    };
  } catch (error) {
    console.error("Evernote import error:", error);
    throw error;
  }
}

// Function to import from Google Docs
async function importFromGoogleDocs(params: Record<string, any>): Promise<{text: string; title?: string; metadata?: Record<string, any>}> {
  try {
    const token = params.token || googleApiKey;
    const documentId = params.documentId;
    
    if (!token || !documentId) {
      throw new Error('Missing required parameters for Google Docs import');
    }
    
    // First, get the document metadata
    const metadataResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch Google Doc metadata: ${metadataResponse.statusText}`);
    }
    
    const docMetadata = await metadataResponse.json();
    
    // Get document content
    const contentResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}/content`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!contentResponse.ok) {
      throw new Error(`Failed to fetch Google Doc content: ${contentResponse.statusText}`);
    }
    
    const contentData = await contentResponse.json();
    
    // Extract title from metadata
    const title = docMetadata.title || "Imported Google Document";
    
    // Extract text content from the document structure
    // Google Docs API returns a complex structure that needs to be processed
    // This is a simplified version
    let textContent = "";
    if (contentData.body && contentData.body.content) {
      contentData.body.content.forEach((element: any) => {
        if (element.paragraph) {
          element.paragraph.elements.forEach((paraElement: any) => {
            if (paraElement.textRun && paraElement.textRun.content) {
              textContent += paraElement.textRun.content;
            }
          });
          textContent += "\n\n";
        }
      });
    }
    
    const metadata = {
      source: "Google Docs",
      documentId: documentId,
      title: docMetadata.title,
      createdTime: docMetadata.createdTime,
      modifiedTime: docMetadata.modifiedTime
    };
    
    return {
      text: textContent,
      title,
      metadata
    };
  } catch (error) {
    console.error("Google Docs import error:", error);
    throw error;
  }
}
