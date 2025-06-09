
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { readPdf, PdfResult } from "./pdf-reader.ts";
import { readDocx, DocxResult } from "./docx-reader.ts";
import { convertPdfToImages } from "./pdf-to-image.ts";

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
          console.log('OCR processing requested - converting PDF to images and processing with Vision API');
          
          try {
            // Convert PDF pages to images
            const imageResult = await convertPdfToImages(fileBuffer, 5); // Process max 5 pages
            
            if (!imageResult.success || imageResult.images.length === 0) {
              throw new Error("Failed to convert PDF pages to images for OCR processing");
            }
            
            console.log(`Converted ${imageResult.images.length} PDF pages to images for OCR`);
            
            // Process each image with Google Vision API
            let combinedText = "";
            for (let i = 0; i < imageResult.images.length; i++) {
              const imageBase64 = imageResult.images[i].split(',')[1]; // Remove data URL prefix
              
              const ocrResult = await processImageWithVisionAPI(imageBase64);
              if (ocrResult.text) {
                combinedText += `\n--- Page ${i + 1} ---\n${ocrResult.text}\n`;
              }
            }
            
            documentText = combinedText.trim() || "No text could be extracted from the PDF images.";
            documentTitle = "OCR Processed PDF";
            processingMethod = "ocr-vision-api";
            documentMetadata = {
              processingMethod: "ocr-vision-api",
              pagesProcessed: imageResult.images.length,
              provider: "google-vision"
            };
            
            console.log(`OCR processing complete. Extracted ${documentText.length} characters from ${imageResult.images.length} pages`);
            
          } catch (ocrError) {
            console.error('OCR processing failed:', ocrError);
            documentText = `OCR processing failed: ${ocrError.message}\n\nThis could be due to:\n• API key not configured properly\n• PDF format not supported for image conversion\n• Network connectivity issues\n\nPlease try again or contact support if the issue persists.`;
            documentTitle = "OCR Processing Failed";
            processingMethod = "ocr-failed";
            documentMetadata = {
              processingMethod: "ocr-failed",
              error: ocrError.message
            };
          }
        } else {
          // Use the existing PDF text extraction
          const pdfResult: PdfResult = await readPdf(fileBuffer);
          
          // Check if we got meaningful text or just encoded garbage
          const hasReadableText = pdfResult.text && 
            pdfResult.text.length > 20 && 
            /[a-zA-Z\s]{10,}/.test(pdfResult.text) && // Contains readable words
            !(/[^\x20-\x7E\n]{20,}/.test(pdfResult.text)); // Not mostly non-printable chars
          
          if (hasReadableText) {
            documentText = pdfResult.text;
            documentTitle = pdfResult.title || "PDF Document";
            documentMetadata = pdfResult.metadata || {};
            processingMethod = "text-extraction-success";
          } else {
            // Text extraction failed - likely image-based or encoded PDF
            documentText = "This PDF appears to contain primarily images, scanned content, or encoded text that cannot be extracted using standard text extraction methods. The document may be:\n\n" +
              "• A scanned document (image-based PDF)\n" +
              "• A PDF with complex formatting or fonts\n" +
              "• A password-protected or encrypted PDF\n" +
              "• A PDF created from images\n\n" +
              "To extract text from this type of document, please enable the 'Force OCR processing' option, which will attempt to recognize text from images using Google Vision API.";
            documentTitle = "Text Extraction Failed - OCR Recommended";
            processingMethod = "text-extraction-failed";
            documentMetadata = {
              processingMethod: "text-extraction-failed",
              originalTextLength: pdfResult.text?.length || 0,
              suggestion: "Try OCR processing for image-based content",
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
          requiresOCR: processingMethod.includes('failed') || processingMethod.includes('ocr')
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
 * Process image with Google Cloud Vision API
 */
async function processImageWithVisionAPI(imageBase64: string): Promise<{ text: string; confidence?: number }> {
  const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
  
  if (!googleApiKey) {
    throw new Error("Google Cloud Vision API key is not configured");
  }
  
  console.log("Processing image with Google Cloud Vision API");
  
  try {
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBase64
            },
            features: [
              {
                type: 'TEXT_DETECTION',
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
    const textAnnotations = data.responses[0]?.textAnnotations;
    const extractedText = textAnnotations && textAnnotations.length > 0 
      ? textAnnotations[0].description 
      : "";
    
    console.log(`Vision API extracted ${extractedText.length} characters`);
    
    return {
      text: extractedText,
      confidence: data.responses[0]?.textAnnotations?.[0]?.confidence || 0.8
    };
  } catch (error) {
    console.error("Google Cloud Vision processing error:", error);
    throw new Error(`Vision API processing failed: ${error.message}`);
  }
}
