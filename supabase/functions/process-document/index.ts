
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
        console.log('Processing PDF document with Google Vision API');
        
        try {
          // Check if we have the Google Vision API key
          const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
          if (!googleApiKey) {
            documentText = "Google Cloud Vision API key is not configured.\n\n" +
              "To process PDFs, you need to:\n" +
              "1. Set up a Google Cloud project\n" +
              "2. Enable the Cloud Vision API\n" +
              "3. Create an API key\n" +
              "4. Add the API key to your Supabase secrets as 'GOOGLE_CLOUD_API_KEY'";
            documentTitle = "API Key Required";
            processingMethod = "api-key-missing";
            documentMetadata = {
              processingMethod: "api-key-missing"
            };
          } else {
            // Try Google Vision API for PDFs using the correct endpoint
            try {
              const visionResult = await processPdfWithVisionAPI(fileBuffer, googleApiKey);
              
              if (visionResult.text && visionResult.text.trim()) {
                documentText = visionResult.text.trim();
                documentTitle = "PDF Processed with Vision API";
                processingMethod = "vision-api-success";
                documentMetadata = {
                  processingMethod: "vision-api-success",
                  confidence: visionResult.confidence || 0.9,
                  provider: "google-vision",
                  pages: visionResult.pages || 1
                };
                
                console.log(`Vision API processing complete. Extracted ${documentText.length} characters from PDF`);
              } else {
                throw new Error("No text extracted from Vision API");
              }
            } catch (visionError) {
              console.error('Vision API processing failed, trying fallback:', visionError);
              
              // Fallback to standard PDF text extraction
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
              } else {
                documentText = `PDF processing failed.\n\n` +
                  "This PDF appears to contain primarily images or scanned content that couldn't be processed.\n\n" +
                  `Vision API Error: ${visionError.message}\n\n` +
                  "Please ensure:\n" +
                  "• Your Google Cloud Vision API key is configured correctly\n" +
                  "• API quota is not exceeded\n" +
                  "• Billing is enabled for your Google Cloud project";
                documentTitle = "Processing Failed";
                processingMethod = "all-processing-failed";
                documentMetadata = {
                  processingMethod: "all-processing-failed",
                  visionApiError: visionError.message
                };
              }
            }
          }
          
        } catch (error) {
          console.error('PDF processing error:', error);
          documentText = `Error processing PDF: ${error.message}`;
          documentTitle = "Processing Error";
          processingMethod = "processing-error";
          documentMetadata = {
            processingMethod: "processing-error",
            error: error.message
          };
        }
        
        console.log(`PDF processing complete. Method: ${processingMethod}, Text length: ${documentText.length}`);
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
 * Process PDF with Google Cloud Vision API using the correct document processing endpoint
 */
async function processPdfWithVisionAPI(pdfBuffer: ArrayBuffer, apiKey: string): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF with Google Cloud Vision API using document processing");
  
  try {
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(pdfBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Pdf = btoa(binaryString);
    
    console.log(`Converted PDF to base64, size: ${base64Pdf.length} characters`);
    
    // Use the correct endpoint for document text detection with inputConfig
    const url = `https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`;
    
    const requestBody = {
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
          ],
          pages: [1, 2, 3, 4, 5] // Process first 5 pages
        }
      ]
    };
    
    console.log('Sending request to Vision API with document processing endpoint');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`Vision API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API error response:', errorText);
      throw new Error(`Google Cloud Vision API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Vision API response received, processing results...');
    
    // Extract text from the response
    let extractedText = '';
    let totalPages = 0;
    
    if (data.responses && data.responses.length > 0) {
      for (const response of data.responses) {
        if (response.fullTextAnnotation && response.fullTextAnnotation.text) {
          extractedText += response.fullTextAnnotation.text + '\n';
          totalPages++;
        }
      }
    }
    
    console.log(`Vision API extracted ${extractedText.length} characters from ${totalPages} pages`);
    
    if (!extractedText.trim()) {
      throw new Error('No text content found in PDF using Vision API');
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
