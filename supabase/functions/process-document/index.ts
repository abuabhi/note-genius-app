
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
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
        
        // Check if we have the Google Cloud service account JSON
        const serviceAccountJson = Deno.env.get("GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON");
        const gcsBucket = Deno.env.get("GOOGLE_CLOUD_STORAGE_BUCKET");
        
        if (serviceAccountJson && gcsBucket) {
          console.log('Attempting Google Vision API processing with service account auth');
          
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
                pages: visionResult.pages || 1
              };
              
              console.log(`Google Vision API processing successful. Extracted ${documentText.length} characters from PDF`);
            } else {
              throw new Error("Google Vision API returned insufficient text content");
            }
          } catch (visionError) {
            console.error('Google Vision API processing failed:', visionError.message);
            
            // Fallback to OpenAI Vision API
            const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
            if (openaiApiKey) {
              console.log('Falling back to OpenAI Vision API');
              
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
                    fallbackUsed: true
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
                  openaiVisionError: openaiError.message
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
                openaiNotConfigured: true
              };
            }
          }
        } else {
          // Try OpenAI Vision if Google Cloud is not configured
          const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
          if (openaiApiKey) {
            console.log('Google Cloud not configured, using OpenAI Vision API');
            
            try {
              const openaiResult = await processPdfWithOpenAIVision(fileBuffer, openaiApiKey);
              
              if (openaiResult.text && openaiResult.text.trim() && openaiResult.text.length > 20) {
                documentText = openaiResult.text.trim();
                documentTitle = "PDF Processed with OpenAI Vision";
                processingMethod = "openai-vision-success";
                documentMetadata = {
                  processingMethod: "openai-vision-success",
                  provider: "openai-vision",
                  googleCloudNotConfigured: true
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
                openaiError: openaiError.message
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
 * Process PDF with Google Cloud Vision API using service account authentication
 */
async function processPdfWithVisionAPIAsync(
  pdfBuffer: ArrayBuffer, 
  serviceAccountJson: string, 
  gcsBucket: string
): Promise<{ text: string; confidence?: number; pages?: number }> {
  console.log("Processing PDF with Google Cloud Vision API (Service Account Auth)");
  
  try {
    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountJson);
    
    // Step 1: Upload PDF to Google Cloud Storage
    const fileName = `temp-pdf-${Date.now()}.pdf`;
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
    await cleanupGCSFiles(gcsBucket, fileName, credentials);
    
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

/**
 * Process PDF with OpenAI Vision API
 */
async function processPdfWithOpenAIVision(
  pdfBuffer: ArrayBuffer,
  apiKey: string
): Promise<{ text: string; confidence?: number }> {
  console.log("Processing PDF with OpenAI Vision API");
  
  try {
    // Convert PDF to base64
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    
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
                text: 'Please extract all text content from this PDF document. Return only the extracted text, no additional commentary or formatting.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';
    
    if (!extractedText.trim()) {
      throw new Error('No text content extracted from PDF');
    }
    
    return {
      text: extractedText,
      confidence: 0.85
    };
    
  } catch (error) {
    console.error("OpenAI Vision PDF processing error:", error);
    throw new Error(`OpenAI Vision processing failed: ${error.message}`);
  }
}

/**
 * Generate JWT token for service account authentication
 */
async function generateJWT(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  
  // Create JWT header
  const header = { alg: 'RS256', typ: 'JWT' };
  
  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
  
  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(credentials.private_key.replace(/\\n/g, '\n')),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]);
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Get access token using service account
 */
async function getAccessToken(credentials: any): Promise<string> {
  const jwt = await generateJWT(credentials);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Upload PDF to Google Cloud Storage with service account authentication
 */
async function uploadToGCSWithServiceAccount(
  pdfBuffer: ArrayBuffer, 
  bucket: string, 
  fileName: string, 
  credentials: any
): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${fileName}`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
 * Start async batch annotation job with service account authentication
 */
async function startAsyncBatchAnnotation(
  inputUri: string, 
  bucket: string, 
  credentials: any
): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const url = 'https://vision.googleapis.com/v1/files:asyncBatchAnnotate';
  const outputPrefix = `vision-output-${Date.now()}`;
  
  const requestBody = {
    requests: [
      {
        inputConfig: {
          gcsSource: { uri: inputUri },
          mimeType: 'application/pdf'
        },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        outputConfig: {
          gcsDestination: { uri: `gs://${bucket}/${outputPrefix}/` },
          batchSize: 2
        }
      }
    ]
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
 * Poll operation until complete with service account authentication
 */
async function pollOperationUntilComplete(
  operationName: string, 
  credentials: any, 
  maxAttempts = 30
): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const url = `https://vision.googleapis.com/v1/${operationName}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to poll operation: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.done) {
      if (result.error) {
        throw new Error(`Vision API operation failed: ${JSON.stringify(result.error)}`);
      }
      
      const outputUri = result.response?.responses?.[0]?.outputConfig?.gcsDestination?.uri;
      if (!outputUri) {
        throw new Error('No output URI found in operation result');
      }
      
      return outputUri;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Polling attempt ${attempt + 1}/${maxAttempts} - operation still running...`);
  }
  
  throw new Error('Operation timed out after maximum polling attempts');
}

/**
 * Download and parse results from GCS with service account authentication
 */
async function downloadAndParseResults(outputUri: string, credentials: any): Promise<string> {
  const accessToken = await getAccessToken(credentials);
  const bucketMatch = outputUri.match(/gs:\/\/([^\/]+)\/(.+)/);
  if (!bucketMatch) {
    throw new Error('Invalid output URI format');
  }
  
  const bucket = bucketMatch[1];
  const prefix = bucketMatch[2];
  
  // List files in the output directory
  const listUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o?prefix=${encodeURIComponent(prefix)}`;
  
  const listResponse = await fetch(listUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
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
  const downloadUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(fileName)}?alt=media`;
  
  const downloadResponse = await fetch(downloadUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
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
 * Clean up temporary files from GCS with service account authentication
 */
async function cleanupGCSFiles(bucket: string, fileName: string, credentials: any): Promise<void> {
  try {
    const accessToken = await getAccessToken(credentials);
    const deleteUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(fileName)}`;
    
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log('Cleaned up temporary PDF file');
  } catch (error) {
    console.warn('Failed to cleanup temporary files:', error.message);
  }
}
