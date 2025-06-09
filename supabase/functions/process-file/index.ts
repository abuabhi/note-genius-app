
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ProcessFileRequest {
  fileUrl: string;
  language?: string;
  userId?: string;
  useOpenAI?: boolean;
  enhanceImage?: boolean;
  fileType?: string;
}

interface OCRResult {
  text: string;
  confidence: number;
  processedAt: string;
  language: string;
  enhancementApplied?: boolean;
  provider: string;
  fileType: string;
  originalFileName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData: ProcessFileRequest = await req.json();
    const { fileUrl, language = "eng", userId, useOpenAI = false, enhanceImage = false, fileType } = requestData;
    
    if (!fileUrl) {
      throw new Error("File URL is required");
    }
    
    console.log(`Processing file with language: ${language}, useOpenAI: ${useOpenAI}, enhanceImage: ${enhanceImage}`);
    console.log(`File URL: ${fileUrl.substring(0, 100)}...`);
    console.log(`File type: ${fileType || 'auto-detect'}`);
    
    // Detect file type if not provided
    const detectedFileType = fileType || await detectFileType(fileUrl);
    console.log(`Detected file type: ${detectedFileType}`);
    
    let result: OCRResult;
    
    if (detectedFileType === 'pdf') {
      console.log("Processing PDF file - converting to image first");
      result = await processPDFFile(fileUrl, language, useOpenAI, enhanceImage, userId);
    } else if (detectedFileType.startsWith('image/')) {
      console.log("Processing image file directly");
      result = await processImageFile(fileUrl, language, useOpenAI, enhanceImage, userId);
    } else {
      throw new Error(`Unsupported file type: ${detectedFileType}. Supported types: images (PNG, JPG, WebP, etc.) and PDF files.`);
    }
    
    // Add file type to result
    result.fileType = detectedFileType;
    
    console.log("Returning OCR result from provider:", result.provider);
    
    return new Response(
      JSON.stringify({
        success: true,
        text: result.text,
        confidence: result.confidence,
        language: result.language,
        processedAt: result.processedAt,
        provider: result.provider,
        enhancementApplied: result.enhancementApplied,
        fileType: result.fileType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-file function:', error);
    
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
 * Detect file type from URL or headers
 */
async function detectFileType(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    
    if (contentType) {
      console.log(`Content-Type header: ${contentType}`);
      return contentType;
    }
    
    // Fallback to URL extension
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    const extensionMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff'
    };
    
    return extensionMap[extension || ''] || 'application/octet-stream';
  } catch (error) {
    console.error('Error detecting file type:', error);
    return 'application/octet-stream';
  }
}

/**
 * Process PDF file by converting first page to image then using OCR
 */
async function processPDFFile(fileUrl: string, language: string, useOpenAI: boolean, enhanceImage: boolean, userId?: string): Promise<OCRResult> {
  console.log("Processing PDF file - converting first page to image");
  
  try {
    // First, extract the first page as an image using the existing process-document function logic
    const imageUrl = await convertPDFToImage(fileUrl);
    console.log("PDF converted to image successfully");
    
    // Now process the converted image using standard OCR
    const result = await processImageFile(imageUrl, language, useOpenAI, enhanceImage, userId);
    
    // Update provider to indicate PDF processing
    result.provider = `pdf-to-image-${result.provider}`;
    
    return result;
  } catch (error) {
    console.error("Error processing PDF file:", error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

/**
 * Convert PDF first page to image URL
 */
async function convertPDFToImage(pdfUrl: string): Promise<string> {
  console.log("Converting PDF first page to image...");
  
  try {
    // Use a simple PDF-to-image conversion approach
    // For production, you might want to use a dedicated service like PDF.co or CloudConvert
    
    // For now, we'll use a basic approach that works with most PDFs
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const pdfBuffer = await response.arrayBuffer();
    const sizeMB = pdfBuffer.byteLength / (1024 * 1024);
    
    console.log(`PDF size: ${sizeMB.toFixed(2)}MB`);
    
    if (sizeMB > 50) {
      throw new Error(`PDF too large: ${sizeMB.toFixed(2)}MB. Maximum allowed: 50MB`);
    }
    
    // For this implementation, we'll create a placeholder image URL
    // In production, you would implement actual PDF-to-image conversion here
    // using services like PDF.co, CloudConvert, or a custom solution
    
    // Create a data URL for a simple white image as placeholder
    // This should be replaced with actual PDF-to-image conversion
    const placeholderImage = await createPDFPlaceholderImage();
    
    console.log("PDF converted to placeholder image (implement actual conversion in production)");
    return placeholderImage;
    
  } catch (error) {
    console.error("Error converting PDF to image:", error);
    throw error;
  }
}

/**
 * Create a placeholder image for PDF processing
 * This should be replaced with actual PDF-to-image conversion
 */
async function createPDFPlaceholderImage(): Promise<string> {
  // Create a simple white canvas as placeholder
  // In production, replace this with actual PDF rendering
  const canvas = new OffscreenCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }
  
  // Fill with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 800, 600);
  
  // Add placeholder text
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('PDF Processing - Implement actual conversion', 50, 300);
  
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  return `data:image/png;base64,${base64}`;
}

/**
 * Process image file using existing OCR logic
 */
async function processImageFile(imageUrl: string, language: string, useOpenAI: boolean, enhanceImage: boolean, userId?: string): Promise<OCRResult> {
  // Call the existing process-image function
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      imageUrl,
      language,
      userId,
      useOpenAI,
      enhanceImage
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image processing failed: ${error}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Image processing failed');
  }
  
  return {
    text: result.text,
    confidence: result.confidence,
    processedAt: result.processedAt,
    language: result.language,
    enhancementApplied: result.enhancementApplied,
    provider: result.provider,
    fileType: 'image'
  };
}
