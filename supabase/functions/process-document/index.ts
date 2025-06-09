
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
          console.log('OCR processing requested - this requires image conversion');
          documentText = "This PDF appears to contain images, scanned content, or complex formatting that requires OCR (Optical Character Recognition) processing. Please enable the 'Force OCR processing' option to extract text from image-based content, or try converting the PDF to a text-based format first.";
          documentTitle = "OCR Processing Required";
          processingMethod = "ocr-required";
          documentMetadata = {
            processingMethod: "ocr-required",
            suggestion: "Enable OCR processing for image-based PDFs"
          };
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
              "To extract text from this type of document, please enable the 'Force OCR processing' option, which will attempt to recognize text from images.";
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
