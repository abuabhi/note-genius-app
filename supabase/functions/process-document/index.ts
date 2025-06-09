
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
        
        // Check if we have the Google Vision API key and bucket name
        const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
        const gcsBucket = Deno.env.get("GOOGLE_CLOUD_STORAGE_BUCKET");
        
        if (googleApiKey && gcsBucket) {
          console.log('Attempting Google Vision API processing with GCS workflow');
          
          try {
            const visionResult = await processPdfWithVisionAPIAsync(fileBuffer, googleApiKey, gcsBucket);
            
            if (visionResult.text && visionResult.text.trim() && visionResult.text.length > 50) {
              documentText = visionResult.text.trim();
              documentTitle = "PDF Processed with Vision API";
              processingMethod = "vision-api-async-success";
              documentMetadata = {
                processingMethod: "vision-api-async-success",
                confidence: visionResult.confidence || 0.9,
                provider: "google-vision-async",
                pages: visionResult.pages || 1
              };
              
              console.log(`Vision API async processing successful. Extracted ${documentText.length} characters from PDF`);
            } else {
              throw new Error("Vision API returned insufficient text content");
            }
          } catch (visionError) {
            console.error('Vision API async processing failed:', visionError.message);
            
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
                "• Google Cloud Storage bucket is configured (GOOGLE_CLOUD_STORAGE_BUCKET)\n" +
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
          console.log('Google Vision API key or GCS bucket not configured, using standard extraction');
          
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
            documentText = "Google Cloud Vision API key or GCS bucket is not configured.\n\n" +
              "To process PDFs with OCR capabilities, you need to:\n" +
              "1. Set up a Google Cloud project\n" +
              "2. Enable the Cloud Vision API and Cloud Storage API\n" +
              "3. Create an API key\n" +
              "4. Create a Google Cloud Storage bucket\n" +
              "5. Add the API key to your Supabase secrets as 'GOOGLE_CLOUD_API_KEY'\n" +
              "6. Add the bucket name to your Supabase secrets as 'GOOGLE_CLOUD_STORAGE_BUCKET'";
            documentTitle = "Configuration Required";
            processingMethod = "config-missing";
            documentMetadata = {
              processingMethod: "config-missing"
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
 * Process PDF with Google Cloud Vision API using the correct async document processing workflow
 */
async function processPdfWithVisionAPIAsync(pdfBuffer: ArrayBuffer, apiKey: string, gcsBucket: string): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF with Google Cloud Vision API (Async Workflow)");
  
  try {
    // Step 1: Upload PDF to Google Cloud Storage
    const fileName = `temp-pdf-${Date.now()}.pdf`;
    const gcsUri = await uploadToGCS(pdfBuffer, gcsBucket, fileName, apiKey);
    console.log(`PDF uploaded to GCS: ${gcsUri}`);
    
    // Step 2: Start async batch annotation
    const operationName = await startAsyncBatchAnnotation(gcsUri, gcsBucket, apiKey);
    console.log(`Started async operation: ${operationName}`);
    
    // Step 3: Poll for completion
    const resultUri = await pollOperationUntilComplete(operationName, apiKey);
    console.log(`Operation completed, results at: ${resultUri}`);
    
    // Step 4: Download and parse results
    const extractedText = await downloadAndParseResults(resultUri, apiKey);
    console.log(`Successfully extracted ${extractedText.length} characters`);
    
    // Step 5: Clean up temporary files
    await cleanupGCSFiles(gcsBucket, fileName, apiKey);
    
    return {
      text: extractedText,
      confidence: 0.95,
      pages: 1 // We'll estimate this for now
    };
    
  } catch (error) {
    console.error("Google Cloud Vision PDF async processing error:", error);
    throw new Error(`Vision API async processing failed: ${error.message}`);
  }
}

/**
 * Upload PDF to Google Cloud Storage
 */
async function uploadToGCS(pdfBuffer: ArrayBuffer, bucket: string, fileName: string, apiKey: string): Promise<string> {
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${fileName}&key=${apiKey}`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: pdfBuffer
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload to GCS: ${response.status} ${errorText}`);
  }
  
  return `gs://${bucket}/${fileName}`;
}

/**
 * Start async batch annotation job
 */
async function startAsyncBatchAnnotation(inputUri: string, bucket: string, apiKey: string): Promise<string> {
  const url = `https://vision.googleapis.com/v1/files:asyncBatchAnnotate?key=${apiKey}`;
  const outputPrefix = `vision-output-${Date.now()}`;
  
  const requestBody = {
    requests: [
      {
        inputConfig: {
          gcsSource: {
            uri: inputUri
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
            uri: `gs://${bucket}/${outputPrefix}/`
          },
          batchSize: 2
        }
      }
    ]
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to start async annotation: ${response.status} ${errorText}`);
  }
  
  const result = await response.json();
  return result.name;
}

/**
 * Poll operation until complete
 */
async function pollOperationUntilComplete(operationName: string, apiKey: string, maxAttempts = 30): Promise<string> {
  const url = `https://vision.googleapis.com/v1/${operationName}?key=${apiKey}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to poll operation: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.done) {
      if (result.error) {
        throw new Error(`Vision API operation failed: ${JSON.stringify(result.error)}`);
      }
      
      // Extract the output file URI from the response
      const outputUri = result.response?.responses?.[0]?.outputConfig?.gcsDestination?.uri;
      if (!outputUri) {
        throw new Error('No output URI found in operation result');
      }
      
      return outputUri;
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Polling attempt ${attempt + 1}/${maxAttempts} - operation still running...`);
  }
  
  throw new Error('Operation timed out after maximum polling attempts');
}

/**
 * Download and parse results from GCS
 */
async function downloadAndParseResults(outputUri: string, apiKey: string): Promise<string> {
  // The outputUri is a directory, we need to find the actual JSON file
  const bucketMatch = outputUri.match(/gs:\/\/([^\/]+)\/(.+)/);
  if (!bucketMatch) {
    throw new Error('Invalid output URI format');
  }
  
  const bucket = bucketMatch[1];
  const prefix = bucketMatch[2];
  
  // List files in the output directory
  const listUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o?prefix=${encodeURIComponent(prefix)}&key=${apiKey}`;
  
  const listResponse = await fetch(listUrl);
  if (!listResponse.ok) {
    const errorText = await listResponse.text();
    throw new Error(`Failed to list output files: ${listResponse.status} ${errorText}`);
  }
  
  const listResult = await listResponse.json();
  const jsonFiles = listResult.items?.filter((item: any) => item.name.endsWith('.json')) || [];
  
  if (jsonFiles.length === 0) {
    throw new Error('No JSON result files found in output directory');
  }
  
  // Download the first JSON file
  const fileName = jsonFiles[0].name;
  const downloadUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(fileName)}?alt=media&key=${apiKey}`;
  
  const downloadResponse = await fetch(downloadUrl);
  if (!downloadResponse.ok) {
    const errorText = await downloadResponse.text();
    throw new Error(`Failed to download result file: ${downloadResponse.status} ${errorText}`);
  }
  
  const resultData = await downloadResponse.json();
  
  // Extract text from the result
  let extractedText = '';
  if (resultData.responses && resultData.responses.length > 0) {
    for (const response of resultData.responses) {
      if (response.fullTextAnnotation && response.fullTextAnnotation.text) {
        extractedText += response.fullTextAnnotation.text + '\n';
      }
    }
  }
  
  if (!extractedText.trim()) {
    throw new Error('No text content found in Vision API results');
  }
  
  return extractedText.trim();
}

/**
 * Clean up temporary files from GCS
 */
async function cleanupGCSFiles(bucket: string, fileName: string, apiKey: string): Promise<void> {
  try {
    // Delete the uploaded PDF
    const deleteUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(fileName)}?key=${apiKey}`;
    await fetch(deleteUrl, { method: 'DELETE' });
    
    // Note: We're not cleaning up the output directory here to avoid complexity
    // In a production environment, you might want to implement cleanup for output files too
    console.log('Cleaned up temporary PDF file');
  } catch (error) {
    console.warn('Failed to cleanup temporary files:', error.message);
    // Don't throw here as cleanup failure shouldn't fail the main operation
  }
}
