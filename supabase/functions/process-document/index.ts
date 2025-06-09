
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
            // First try Google Vision API for PDFs
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
 * Process PDF with Google Cloud Vision API using the correct files endpoint
 */
async function processPdfWithVisionAPI(pdfBuffer: ArrayBuffer, apiKey: string): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF with Google Cloud Vision API using files endpoint");
  
  try {
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(pdfBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Pdf = btoa(binaryString);
    
    // Use the correct endpoint for document processing
    const url = `https://vision.googleapis.com/v1/files:asyncBatchAnnotate?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            inputConfig: {
              gcsSource: {
                uri: `data:application/pdf;base64,${base64Pdf}`
              },
              mimeType: 'application/pdf'
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION'
              }
            ],
            outputConfig: {
              gcsDestination: {
                uri: 'gs://temp-bucket'
              },
              batchSize: 1
            }
          }
        ]
      })
    });
    
    // If async endpoint fails, fall back to synchronous processing
    if (!response.ok) {
      console.log("Async processing failed, trying synchronous approach");
      return await processPdfSynchronously(base64Pdf, apiKey);
    }
    
    const data = await response.json();
    console.log("Vision API response:", data);
    
    // For now, fall back to synchronous since async requires GCS setup
    return await processPdfSynchronously(base64Pdf, apiKey);
    
  } catch (error) {
    console.error("Google Cloud Vision PDF processing error:", error);
    throw new Error(`Vision API PDF processing failed: ${error.message}`);
  }
}

/**
 * Synchronous PDF processing with Vision API
 */
async function processPdfSynchronously(base64Pdf: string, apiKey: string): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF synchronously with Vision API");
  
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Pdf
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google Cloud Vision API error: ${JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
  const extractedText = fullTextAnnotation?.text || "";
  
  console.log(`Vision API extracted ${extractedText.length} characters from PDF`);
  
  return {
    text: extractedText,
    confidence: 0.9,
    pages: fullTextAnnotation?.pages?.length || 1
  };
}
