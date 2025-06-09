
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { readPdf, PdfResult } from "./pdf-reader.ts";
import { readDocx, DocxResult } from "./docx-reader.ts";

interface ProcessDocumentRequestBody {
  fileUrl?: string;
  fileType?: string;
  userId?: string;
  externalApiParams?: Record<string, any>;
  useOCR?: boolean; // Flag to force OCR processing
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData: ProcessDocumentRequestBody = await req.json();
    const { fileUrl, fileType, userId, externalApiParams, useOCR = false } = requestData;
    
    console.log(`Processing document request: fileType=${fileType}, userId=${userId}, useOCR=${useOCR}`);
    
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
        
        if (useOCR) {
          console.log('OCR processing requested - using Google Vision API directly on PDF');
          
          try {
            // Check if we have the Google Vision API key
            const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
            if (!googleApiKey) {
              documentText = "Google Cloud Vision API key is not configured.\n\n" +
                "To use OCR processing, you need to:\n" +
                "1. Set up a Google Cloud project\n" +
                "2. Enable the Cloud Vision API\n" +
                "3. Create an API key\n" +
                "4. Add the API key to your Supabase secrets as 'GOOGLE_CLOUD_API_KEY'\n\n" +
                "Alternatively, you can try processing without OCR to extract any embedded text.";
              documentTitle = "API Key Required";
              processingMethod = "api-key-missing";
              documentMetadata = {
                processingMethod: "api-key-missing"
              };
            } else {
              // Process PDF directly with Google Vision API
              const ocrResult = await processPdfWithVisionAPI(fileBuffer, googleApiKey);
              
              if (ocrResult.text && ocrResult.text.trim()) {
                documentText = ocrResult.text.trim();
                documentTitle = "OCR Processed PDF";
                processingMethod = "ocr-vision-api-pdf";
                documentMetadata = {
                  processingMethod: "ocr-vision-api-pdf",
                  confidence: ocrResult.confidence || 0.8,
                  provider: "google-vision",
                  pages: ocrResult.pages || 1
                };
                
                console.log(`OCR processing complete. Extracted ${documentText.length} characters from PDF`);
              } else {
                documentText = "OCR processing completed but no readable text was found in the PDF.\n\n" +
                  "This could be because:\n" +
                  "• The PDF contains only images without text\n" +
                  "• The text quality is too poor for OCR recognition\n" +
                  "• The text is in a language or font not well supported by OCR\n\n" +
                  "Try using a clearer PDF or one with better text quality.";
                documentTitle = "No Text Detected";
                processingMethod = "ocr-no-text";
                documentMetadata = {
                  processingMethod: "ocr-no-text",
                  provider: "google-vision"
                };
              }
            }
            
          } catch (ocrError) {
            console.error('OCR processing failed:', ocrError);
            
            // Try fallback to standard text extraction
            console.log('Falling back to standard PDF text extraction');
            const pdfResult: PdfResult = await readPdf(fileBuffer);
            
            const hasReadableText = pdfResult.text && 
              pdfResult.text.length > 20 && 
              /[a-zA-Z\s]{10,}/.test(pdfResult.text);
            
            if (hasReadableText) {
              documentText = pdfResult.text;
              documentTitle = pdfResult.title || "PDF Document (OCR Failed, Text Extracted)";
              processingMethod = "ocr-failed-text-extracted";
              documentMetadata = {
                processingMethod: "ocr-failed-text-extracted",
                ocrError: ocrError.message,
                fallbackUsed: true
              };
            } else {
              documentText = `OCR processing failed: ${ocrError.message}\n\n` +
                "Standard text extraction also failed. This PDF appears to contain primarily images or scanned content.\n\n" +
                "This could be due to:\n" +
                "• Google Cloud Vision API key not configured properly\n" +
                "• API quota exceeded or billing not enabled\n" +
                "• Network connectivity issues\n" +
                "• PDF contains only complex images\n\n" +
                "Please check your Google Cloud settings and try again.";
              documentTitle = "Processing Failed";
              processingMethod = "all-processing-failed";
              documentMetadata = {
                processingMethod: "all-processing-failed",
                ocrError: ocrError.message
              };
            }
          }
        } else {
          // Use standard PDF text extraction
          const pdfResult: PdfResult = await readPdf(fileBuffer);
          
          // Check if we got meaningful text
          const hasReadableText = pdfResult.text && 
            pdfResult.text.length > 20 && 
            /[a-zA-Z\s]{10,}/.test(pdfResult.text) && 
            !(/[^\x20-\x7E\n]{20,}/.test(pdfResult.text));
          
          if (hasReadableText) {
            documentText = pdfResult.text;
            documentTitle = pdfResult.title || "PDF Document";
            documentMetadata = pdfResult.metadata || {};
            processingMethod = "text-extraction-success";
          } else {
            // Auto-suggest OCR for poor text extraction
            documentText = "This PDF appears to contain primarily images, scanned content, or encoded text that cannot be extracted using standard text extraction methods.\n\n" +
              "The document may be:\n" +
              "• A scanned document (image-based PDF)\n" +
              "• A PDF with complex formatting or fonts\n" +
              "• A PDF created from images\n\n" +
              "To extract text from this type of document, please enable the 'Force OCR processing' option, which will use Google Vision API to recognize text from the PDF content.";
            documentTitle = "Text Extraction Failed - Try OCR";
            processingMethod = "text-extraction-failed";
            documentMetadata = {
              processingMethod: "text-extraction-failed",
              originalTextLength: pdfResult.text?.length || 0,
              suggestion: "Enable OCR processing for better results",
              extractionQuality: "poor"
            };
          }
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
          processingMethod,
          requiresOCR: processingMethod.includes('failed') && !processingMethod.includes('ocr')
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
 * Process PDF directly with Google Cloud Vision API
 */
async function processPdfWithVisionAPI(pdfBuffer: ArrayBuffer, apiKey: string): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF directly with Google Cloud Vision API");
  
  try {
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(pdfBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Pdf = btoa(binaryString);
    
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
      confidence: 0.9, // Vision API generally has high confidence for PDFs
      pages: fullTextAnnotation?.pages?.length || 1
    };
  } catch (error) {
    console.error("Google Cloud Vision PDF processing error:", error);
    throw new Error(`Vision API PDF processing failed: ${error.message}`);
  }
}
