
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { readPdf, PdfResult } from "./pdf-reader.ts";
import { readDocx, DocxResult } from "./docx-reader.ts";

interface ProcessDocumentRequestBody {
  fileUrl?: string;
  fileType?: string;
  userId?: string;
  externalApiParams?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData: ProcessDocumentRequestBody = await req.json();
    const { fileUrl, fileType, userId, externalApiParams } = requestData;
    
    console.log(`Processing document request: fileType=${fileType}, userId=${userId}`);
    
    // Validate input parameters
    if (!fileType) {
      throw new Error("No file type provided");
    }
    
    let documentText = "";
    let documentTitle = "";
    let documentMetadata = {};
    let processingMethod = "";
    
    if (fileUrl) {
      console.log(`Fetching document from URL: ${fileUrl}`);
      
      // Fetch the file content from the URL
      const fileResponse = await fetch(fileUrl);
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      const fileBuffer = await fileResponse.arrayBuffer();
      
      // Process based on file type
      if (fileType === 'pdf') {
        console.log('Processing PDF document');
        
        // Check if we have the Google Vision API key
        const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
        
        if (googleApiKey) {
          console.log('Attempting Google Vision API processing first');
          
          try {
            const visionResult = await processPdfWithVisionAPI(fileBuffer, googleApiKey);
            
            if (visionResult.text && visionResult.text.trim() && visionResult.text.length > 50) {
              documentText = visionResult.text.trim();
              documentTitle = "PDF Processed with Vision API";
              processingMethod = "vision-api-success";
              documentMetadata = {
                processingMethod: "vision-api-success",
                confidence: visionResult.confidence || 0.9,
                provider: "google-vision",
                pages: visionResult.pages || 1
              };
              
              console.log(`Vision API processing successful. Extracted ${documentText.length} characters from PDF`);
            } else {
              throw new Error("Vision API returned insufficient text content");
            }
          } catch (visionError) {
            console.error('Vision API processing failed:', visionError.message);
            
            // Fallback to standard PDF text extraction
            console.log('Falling back to standard PDF text extraction');
            const pdfResult: PdfResult = await readPdf(fileBuffer);
            
            const hasReadableText = pdfResult.text && 
              pdfResult.text.length > 20 && 
              /[a-zA-Z\s]{10,}/.test(pdfResult.text);
            
            if (hasReadableText) {
              documentText = pdfResult.text;
              documentTitle = pdfResult.title || "PDF Document (Standard Extraction)";
              processingMethod = "standard-text-extraction";
              documentMetadata = {
                processingMethod: "standard-text-extraction",
                visionApiError: visionError.message,
                fallbackUsed: true
              };
              
              console.log(`Standard extraction successful. Extracted ${documentText.length} characters`);
            } else {
              documentText = `PDF processing failed.\n\n` +
                "This PDF appears to contain primarily images or scanned content that couldn't be processed.\n\n" +
                `Vision API Error: ${visionError.message}\n\n` +
                "Please ensure:\n" +
                "• Your Google Cloud Vision API key is configured correctly\n" +
                "• API quota is not exceeded\n" +
                "• Billing is enabled for your Google Cloud project\n" +
                "• The PDF contains readable text (not just images)";
              documentTitle = "Processing Failed";
              processingMethod = "all-processing-failed";
              documentMetadata = {
                processingMethod: "all-processing-failed",
                visionApiError: visionError.message
              };
            }
          }
        } else {
          console.log('Google Vision API key not configured, using standard extraction');
          
          // Use standard PDF text extraction
          const pdfResult: PdfResult = await readPdf(fileBuffer);
          
          const hasReadableText = pdfResult.text && 
            pdfResult.text.length > 20 && 
            /[a-zA-Z\s]{10,}/.test(pdfResult.text);
          
          if (hasReadableText) {
            documentText = pdfResult.text;
            documentTitle = pdfResult.title || "PDF Document (Standard Extraction)";
            processingMethod = "standard-text-extraction";
            documentMetadata = {
              processingMethod: "standard-text-extraction"
            };
            
            console.log(`Standard extraction successful. Extracted ${documentText.length} characters`);
          } else {
            documentText = "Google Cloud Vision API key is not configured.\n\n" +
              "To process PDFs with OCR capabilities, you need to:\n" +
              "1. Set up a Google Cloud project\n" +
              "2. Enable the Cloud Vision API\n" +
              "3. Create an API key\n" +
              "4. Add the API key to your Supabase secrets as 'GOOGLE_CLOUD_API_KEY'";
            documentTitle = "API Key Required";
            processingMethod = "api-key-missing";
            documentMetadata = {
              processingMethod: "api-key-missing"
            };
          }
        }
      } 
      else if (fileType === 'docx' || fileType === 'doc') {
        console.log('Processing Word document');
        const docxResult: DocxResult = await readDocx(fileBuffer);
        documentText = docxResult.text;
        documentTitle = docxResult.title || "Word Document";
        documentMetadata = docxResult.metadata || {};
        processingMethod = "docx";
        console.log(`DOCX processing complete. Title: ${documentTitle}, Text length: ${documentText.length}`);
      } 
      else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } 
    else if (externalApiParams) {
      // Handle external API based document import
      console.log('Processing document from external API parameters');
      
      documentText = `Content imported from ${externalApiParams.source || 'external service'}`;
      documentTitle = externalApiParams.title || `Imported from External Service`;
      documentMetadata = { source: externalApiParams.source };
      processingMethod = "external-api";
      
      console.log(`External API processing complete. Title: ${documentTitle}`);
    } 
    else {
      throw new Error("Either fileUrl or externalApiParams must be provided");
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        text: documentText,
        title: documentTitle,
        metadata: {
          ...documentMetadata,
          processingMethod
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-document function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        details: error.stack || 'No stack trace available'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Process PDF with Google Cloud Vision API using the correct document processing approach
 */
async function processPdfWithVisionAPI(pdfBuffer: ArrayBuffer, apiKey: string): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF with Google Cloud Vision API");
  
  try {
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(pdfBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Pdf = btoa(binaryString);
    
    console.log(`Converted PDF to base64, size: ${base64Pdf.length} characters`);
    
    // First, try the synchronous approach with files:annotate
    const syncUrl = `https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`;
    
    const syncRequestBody = {
      requests: [
        {
          inputConfig: {
            content: base64Pdf,
            mimeType: 'application/pdf'
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION'
            }
          ]
        }
      ]
    };
    
    console.log('Attempting synchronous PDF processing with Vision API');
    
    const syncResponse = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(syncRequestBody)
    });
    
    console.log(`Sync Vision API response status: ${syncResponse.status}`);
    
    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.error('Sync Vision API error response:', errorText);
      throw new Error(`Google Cloud Vision API sync error (${syncResponse.status}): ${errorText}`);
    }
    
    const syncData = await syncResponse.json();
    console.log('Sync Vision API response received, processing results...');
    
    // Extract text from the synchronous response
    let extractedText = '';
    let totalPages = 0;
    
    if (syncData.responses && syncData.responses.length > 0) {
      for (const response of syncData.responses) {
        if (response.fullTextAnnotation && response.fullTextAnnotation.text) {
          extractedText += response.fullTextAnnotation.text + '\n';
          totalPages++;
        } else if (response.error) {
          console.error('Vision API response error:', response.error);
          throw new Error(`Vision API response error: ${response.error.message || 'Unknown error'}`);
        }
      }
    }
    
    console.log(`Sync Vision API extracted ${extractedText.length} characters from ${totalPages} pages`);
    
    if (!extractedText.trim()) {
      throw new Error('No text content found in PDF using synchronous Vision API');
    }
    
    return {
      text: extractedText.trim(),
      confidence: 0.9,
      pages: totalPages
    };
    
  } catch (error) {
    console.error("Google Cloud Vision PDF processing error:", error);
    throw new Error(`Vision API PDF processing failed: ${error.message}`);
  }
}
