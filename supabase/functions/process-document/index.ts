
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { readDocx, DocxResult } from "./docx-reader.ts";
import { convertPdfToImages, PdfConversionResult } from "./pdf-converter.ts";
import { 
  getAccessToken, 
  uploadToGCSWithServiceAccount, 
  startAsyncBatchAnnotation, 
  pollOperationUntilComplete, 
  downloadAndParseResults, 
  cleanupGCSFiles 
} from "./google-vision-helpers.ts";

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
      const fileSizeKB = Math.round(fileBuffer.byteLength / 1024);
      console.log(`File fetched successfully: ${fileSizeKB}KB`);
      
      // Process based on file type
      if (fileType === 'pdf') {
        console.log('Processing PDF document');
        
        // Try Google Vision API first
        const serviceAccountJson = Deno.env.get("GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON");
        const gcsBucket = Deno.env.get("GOOGLE_CLOUD_STORAGE_BUCKET");
        
        if (serviceAccountJson && gcsBucket) {
          console.log('Attempting Google Vision API processing');
          
          try {
            const visionResult = await processPdfWithVisionAPIAsync(fileBuffer, serviceAccountJson, gcsBucket);
            
            if (visionResult.text && visionResult.text.trim() && visionResult.text.length > 50) {
              documentText = visionResult.text.trim();
              documentTitle = "PDF Processed with Google Vision API";
              processingMethod = "vision-api-async-success";
              documentMetadata = {
                processingMethod: "vision-api-async-success",
                confidence: visionResult.confidence || 0.9,
                provider: "google-vision-async",
                pages: visionResult.pages || 1,
                fileSizeKB
              };
              
              console.log(`Google Vision API processing successful. Extracted ${documentText.length} characters`);
            } else {
              throw new Error("Google Vision API returned insufficient text content");
            }
          } catch (visionError) {
            console.error('Google Vision API processing failed:', visionError.message);
            
            // Fallback to OpenAI Vision API with PDF conversion
            const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
            if (openaiApiKey) {
              console.log('Falling back to OpenAI Vision API with PDF conversion');
              
              try {
                const openaiResult = await processPdfWithOpenAIVision(fileBuffer, openaiApiKey);
                
                if (openaiResult.text && openaiResult.text.trim() && openaiResult.text.length > 20) {
                  documentText = openaiResult.text.trim();
                  documentTitle = "PDF Processed with OpenAI Vision";
                  processingMethod = "openai-vision-success";
                  documentMetadata = {
                    processingMethod: "openai-vision-success",
                    googleVisionError: visionError.message,
                    provider: "openai-vision",
                    fallbackUsed: true,
                    fileSizeKB,
                    ...openaiResult.metadata
                  };
                  
                  console.log(`OpenAI Vision processing successful. Extracted ${documentText.length} characters`);
                } else {
                  throw new Error("OpenAI Vision returned insufficient text content");
                }
              } catch (openaiError) {
                console.error('OpenAI Vision processing failed:', openaiError.message);
                
                documentText = `PDF processing failed.\n\n` +
                  "Both Google Vision API and OpenAI Vision API failed to process this PDF.\n\n" +
                  `Google Vision Error: ${visionError.message}\n` +
                  `OpenAI Vision Error: ${openaiError.message}\n\n` +
                  "This PDF may contain:\n" +
                  "• Only images or scanned content that can't be processed\n" +
                  "• Corrupted or encrypted content\n" +
                  "• Unsupported formatting\n\n" +
                  "Please try:\n" +
                  "• Using a different PDF file\n" +
                  "• Converting the PDF to images and using the scan feature instead";
                documentTitle = "Processing Failed";
                processingMethod = "all-processing-failed";
                documentMetadata = {
                  processingMethod: "all-processing-failed",
                  googleVisionError: visionError.message,
                  openaiVisionError: openaiError.message,
                  fileSizeKB
                };
              }
            } else {
              documentText = `PDF processing failed.\n\n` +
                "Google Vision API failed and OpenAI API key is not configured.\n\n" +
                `Google Vision Error: ${visionError.message}\n\n` +
                "To enable fallback processing:\n" +
                "• Add your OpenAI API key to Supabase secrets\n" +
                "• Or fix your Google Cloud Vision API configuration";
              documentTitle = "Processing Failed";
              processingMethod = "all-processing-failed";
              documentMetadata = {
                processingMethod: "all-processing-failed",
                googleVisionError: visionError.message,
                openaiNotConfigured: true,
                fileSizeKB
              };
            }
          }
        } else {
          // Try OpenAI Vision if Google Cloud is not configured
          const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
          if (openaiApiKey) {
            console.log('Google Cloud not configured, using OpenAI Vision API with PDF conversion');
            
            try {
              const openaiResult = await processPdfWithOpenAIVision(fileBuffer, openaiApiKey);
              
              if (openaiResult.text && openaiResult.text.trim() && openaiResult.text.length > 20) {
                documentText = openaiResult.text.trim();
                documentTitle = "PDF Processed with OpenAI Vision";
                processingMethod = "openai-vision-success";
                documentMetadata = {
                  processingMethod: "openai-vision-success",
                  provider: "openai-vision",
                  googleCloudNotConfigured: true,
                  fileSizeKB,
                  ...openaiResult.metadata
                };
                
                console.log(`OpenAI Vision processing successful. Extracted ${documentText.length} characters`);
              } else {
                throw new Error("OpenAI Vision returned insufficient text content");
              }
            } catch (openaiError) {
              console.error('OpenAI Vision processing failed:', openaiError.message);
              
              documentText = `PDF processing failed.\n\n` +
                "Neither Google Cloud Vision API nor OpenAI Vision API are properly configured.\n\n" +
                `OpenAI Error: ${openaiError.message}\n\n` +
                "To process PDFs, you need to configure:\n" +
                "• Google Cloud Vision API with service account JSON and GCS bucket, OR\n" +
                "• OpenAI API key for Vision API access\n\n" +
                "Please add the required credentials to your Supabase secrets.";
              documentTitle = "Configuration Required";
              processingMethod = "config-missing";
              documentMetadata = {
                processingMethod: "config-missing",
                openaiError: openaiError.message,
                fileSizeKB
              };
            }
          } else {
            documentText = "PDF processing requires API configuration.\n\n" +
              "To process PDFs with OCR capabilities, you need to configure either:\n\n" +
              "1. Google Cloud Vision API:\n" +
              "   • Set up a Google Cloud project\n" +
              "   • Enable the Cloud Vision API and Cloud Storage API\n" +
              "   • Create a service account and download JSON credentials\n" +
              "   • Create a Google Cloud Storage bucket\n" +
              "   • Add the service account JSON to Supabase secrets as 'GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON'\n" +
              "   • Add the bucket name as 'GOOGLE_CLOUD_STORAGE_BUCKET'\n\n" +
              "2. OpenAI Vision API:\n" +
              "   • Get an OpenAI API key with Vision API access\n" +
              "   • Add it to Supabase secrets as 'OPENAI_API_KEY'";
            documentTitle = "Configuration Required";
            processingMethod = "config-missing";
            documentMetadata = {
              processingMethod: "config-missing",
              fileSizeKB
            };
          }
        }
      } 
      else if (fileType === 'docx' || fileType === 'doc') {
        console.log('Processing Word document');
        const docxResult: DocxResult = await readDocx(fileBuffer);
        documentText = docxResult.text;
        documentTitle = docxResult.title || "Word Document";
        documentMetadata = { ...docxResult.metadata, fileSizeKB };
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
 * Process PDF with OpenAI Vision API after converting to images
 */
async function processPdfWithOpenAIVision(
  pdfBuffer: ArrayBuffer,
  apiKey: string
): Promise<{ text: string; confidence?: number; metadata?: any }> {
  console.log("Processing PDF with OpenAI Vision API (with PDF-to-image conversion)");
  
  try {
    // Convert PDF to images first
    console.log("Converting PDF to images...");
    const conversionResult: PdfConversionResult = await convertPdfToImages(pdfBuffer, 3); // Limit to 3 pages
    
    if (conversionResult.pages.length === 0) {
      throw new Error("PDF conversion produced no readable pages");
    }
    
    console.log(`PDF converted to ${conversionResult.pages.length} images in ${conversionResult.conversionTime}ms`);
    
    // Process each page with OpenAI Vision
    const extractedTexts: string[] = [];
    let totalTokens = 0;
    
    for (let i = 0; i < conversionResult.pages.length; i++) {
      const page = conversionResult.pages[i];
      console.log(`Processing page ${page.pageNumber} with OpenAI Vision...`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please extract all text content from this image of page ${page.pageNumber}. Return only the extracted text, preserving the original formatting and structure as much as possible. Do not add any commentary or explanations.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${page.imageData}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
          temperature: 0.1
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API request failed for page ${page.pageNumber}: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      const pageText = data.choices?.[0]?.message?.content || '';
      
      if (pageText.trim()) {
        extractedTexts.push(`--- Page ${page.pageNumber} ---\n${pageText.trim()}`);
        console.log(`Extracted ${pageText.length} characters from page ${page.pageNumber}`);
      }
      
      // Track token usage
      if (data.usage) {
        totalTokens += data.usage.total_tokens || 0;
      }
      
      // Small delay between requests to be respectful
      if (i < conversionResult.pages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (extractedTexts.length === 0) {
      throw new Error('No text content could be extracted from any PDF pages');
    }
    
    // Combine all extracted text
    const combinedText = extractedTexts.join('\n\n');
    
    console.log(`OpenAI Vision processing completed. Total text: ${combinedText.length} characters, tokens used: ${totalTokens}`);
    
    return {
      text: combinedText,
      confidence: 0.85,
      metadata: {
        pagesProcessed: conversionResult.pages.length,
        totalPages: conversionResult.totalPages,
        conversionTime: conversionResult.conversionTime,
        tokensUsed: totalTokens,
        provider: 'openai-vision'
      }
    };
    
  } catch (error) {
    console.error("OpenAI Vision PDF processing error:", error);
    throw new Error(`OpenAI Vision processing failed: ${error.message}`);
  }
}

/**
 * Process PDF with Google Cloud Vision API using service account authentication (FIXED)
 */
async function processPdfWithVisionAPIAsync(
  pdfBuffer: ArrayBuffer, 
  serviceAccountJson: string, 
  gcsBucket: string
): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF with Google Cloud Vision API (Service Account Auth - FIXED)");
  
  try {
    // Parse and validate service account credentials
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      throw new Error(`Invalid service account JSON: ${parseError.message}`);
    }
    
    // Validate required fields
    if (!credentials.private_key || !credentials.client_email || !credentials.project_id) {
      throw new Error("Service account JSON missing required fields (private_key, client_email, project_id)");
    }
    
    // Step 1: Upload PDF to Google Cloud Storage
    const fileName = `temp-pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`;
    const gcsUri = await uploadToGCSWithServiceAccount(pdfBuffer, gcsBucket, fileName, credentials);
    console.log(`PDF uploaded to GCS: ${gcsUri}`);
    
    // Step 2: Start async batch annotation
    const operationName = await startAsyncBatchAnnotation(gcsUri, gcsBucket, credentials);
    console.log(`Started async operation: ${operationName}`);
    
    // Step 3: Poll for completion
    const resultUri = await pollOperationUntilComplete(operationName, credentials);
    console.log(`Operation completed, results at: ${resultUri}`);
    
    // Step 4: Download and parse results
    const extractedText = await downloadAndParseResults(resultUri, credentials);
    console.log(`Successfully extracted ${extractedText.length} characters`);
    
    // Step 5: Clean up temporary files
    try {
      await cleanupGCSFiles(gcsBucket, fileName, credentials);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temporary files:', cleanupError.message);
    }
    
    return {
      text: extractedText,
      confidence: 0.95,
      pages: 1
    };
    
  } catch (error) {
    console.error("Google Cloud Vision PDF processing error:", error);
    throw new Error(`Vision API processing failed: ${error.message}`);
  }
}
