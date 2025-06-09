
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { readPdfWithPdfJs, ProfessionalPdfResult } from "./professional-pdf-reader.ts";
import { convertPdfToImages } from "./pdf-to-image.ts";
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
        console.log('Processing PDF document with professional extraction');
        
        if (useOCR) {
          // Force OCR processing
          console.log('Forcing OCR processing for PDF');
          const imageResult = await convertPdfToImages(fileBuffer, 10);
          
          if (imageResult.success && imageResult.images.length > 0) {
            // Call OCR processing function for each image
            let ocrText = "";
            for (let i = 0; i < imageResult.images.length; i++) {
              try {
                // Call the process-image function for OCR
                const ocrResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-image`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                  },
                  body: JSON.stringify({
                    imageUrl: imageResult.images[i],
                    language: 'eng',
                    userId: userId,
                    useOpenAI: false, // Use cost-effective Google Vision
                    enhanceImage: false
                  })
                });
                
                if (ocrResponse.ok) {
                  const ocrData = await ocrResponse.json();
                  if (ocrData.text) {
                    ocrText += `Page ${i + 1}:\n${ocrData.text}\n\n`;
                  }
                }
              } catch (ocrError) {
                console.error(`OCR error for page ${i + 1}:`, ocrError);
                continue;
              }
            }
            
            documentText = ocrText || "No text could be extracted via OCR";
            documentTitle = "OCR Processed PDF";
            processingMethod = "OCR";
            documentMetadata = {
              processingMethod: "forced-ocr",
              pageCount: imageResult.pageCount,
              ocrProvider: "google-vision"
            };
          } else {
            throw new Error("Failed to convert PDF to images for OCR");
          }
        } else {
          // Try PDF.js first
          const pdfResult: ProfessionalPdfResult = await readPdfWithPdfJs(fileBuffer);
          
          if (pdfResult.processingMethod === 'requires-ocr') {
            console.log('PDF requires OCR processing, converting to images');
            
            const imageResult = await convertPdfToImages(fileBuffer, 10);
            
            if (imageResult.success && imageResult.images.length > 0) {
              // Process with OCR
              let ocrText = "";
              for (let i = 0; i < imageResult.images.length; i++) {
                try {
                  const ocrResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-image`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                    },
                    body: JSON.stringify({
                      imageUrl: imageResult.images[i],
                      language: 'eng',
                      userId: userId,
                      useOpenAI: false,
                      enhanceImage: false
                    })
                  });
                  
                  if (ocrResponse.ok) {
                    const ocrData = await ocrResponse.json();
                    if (ocrData.text) {
                      ocrText += `Page ${i + 1}:\n${ocrData.text}\n\n`;
                    }
                  }
                } catch (ocrError) {
                  console.error(`OCR error for page ${i + 1}:`, ocrError);
                  continue;
                }
              }
              
              documentText = ocrText || pdfResult.text;
              documentTitle = "OCR + PDF.js Processed";
              processingMethod = "hybrid-ocr";
              documentMetadata = {
                ...pdfResult.metadata,
                ocrProcessed: true,
                hybridProcessing: true
              };
            } else {
              // Fallback to PDF.js result even if poor
              documentText = pdfResult.text;
              documentTitle = pdfResult.title || "PDF Document";
              processingMethod = "pdf.js-fallback";
              documentMetadata = pdfResult.metadata;
            }
          } else {
            // PDF.js extraction was successful
            documentText = pdfResult.text;
            documentTitle = pdfResult.title || "PDF Document";
            processingMethod = "pdf.js";
            documentMetadata = pdfResult.metadata;
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
          professional: true
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
