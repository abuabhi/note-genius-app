
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ProcessImageRequest {
  imageUrl: string;
  language?: string;
  userId?: string;
  useOpenAI?: boolean;
  enhanceImage?: boolean;
}

interface OCRResult {
  text: string;
  confidence: number;
  processedAt: string;
  language: string;
  enhancementApplied?: boolean;
  provider: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData: ProcessImageRequest = await req.json();
    const { imageUrl, language = "eng", userId, useOpenAI = false, enhanceImage = false } = requestData;
    
    if (!imageUrl) {
      throw new Error("Image URL is required");
    }
    
    console.log(`Processing image with language: ${language}, useOpenAI: ${useOpenAI}, enhanceImage: ${enhanceImage}`);
    console.log(`Image URL: ${imageUrl.substring(0, 100)}...`);
    
    // Check API keys
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
    
    console.log(`API Keys available: OpenAI: ${openaiApiKey ? "Yes" : "No"}, Google Cloud: ${googleApiKey ? "Yes" : "No"}`);
    
    let result: OCRResult;
    
    // Always try OpenAI first if available (especially for handwritten text)
    if (openaiApiKey) {
      console.log("Using OpenAI Vision API for handwritten text recognition...");
      try {
        result = await processWithOpenAI(imageUrl, language);
        console.log("OpenAI processing completed successfully");
      } catch (openaiError) {
        console.error("OpenAI processing failed, falling back to Google Cloud Vision:", openaiError);
        if (googleApiKey) {
          result = await processWithCloudOCR(imageUrl, language, enhanceImage);
        } else {
          throw new Error(`OpenAI failed: ${openaiError.message}. No Google Cloud API key available for fallback.`);
        }
      }
    } else if (googleApiKey) {
      console.log("OpenAI API key not available, using Google Cloud Vision API...");
      result = await processWithCloudOCR(imageUrl, language, enhanceImage);
    } else {
      throw new Error("No OCR API keys available. Please configure either OPENAI_API_KEY or GOOGLE_CLOUD_API_KEY.");
    }
    
    // Log usage metrics if user ID is provided
    if (userId) {
      console.log(`Logging OCR usage for user: ${userId}`);
    }
    
    console.log("Returning OCR result from provider:", result.provider);
    
    return new Response(
      JSON.stringify({
        success: true,
        text: result.text,
        confidence: result.confidence,
        language: result.language,
        processedAt: result.processedAt,
        provider: result.provider,
        enhancementApplied: result.enhancementApplied
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-image function:', error);
    
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
 * Validate OpenAI API key with a simple test call
 */
async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    console.log("Validating OpenAI API key...");
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    
    const isValid = response.ok;
    console.log(`OpenAI API key validation: ${isValid ? "SUCCESS" : "FAILED"}`);
    return isValid;
  } catch (error) {
    console.error("OpenAI API key validation error:", error);
    return false;
  }
}

/**
 * Improved image to base64 conversion with better error handling
 */
async function convertImageToBase64(imageUrl: string): Promise<string> {
  console.log("Converting image to base64...");
  
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type") || "image/png";
    
    // Validate content type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      throw new Error(`Unsupported image type: ${contentType}. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Check image size (OpenAI limit is 20MB)
    const sizeMB = arrayBuffer.byteLength / (1024 * 1024);
    console.log(`Image size: ${sizeMB.toFixed(2)}MB`);
    
    if (sizeMB > 20) {
      throw new Error(`Image too large: ${sizeMB.toFixed(2)}MB. Maximum allowed: 20MB`);
    }
    
    // Modern and safe base64 encoding
    let base64: string;
    
    if (typeof Buffer !== 'undefined') {
      // Deno/Node.js environment - use Buffer for better performance and safety
      base64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      // Browser fallback - use improved method
      const uint8Array = new Uint8Array(arrayBuffer);
      const binary = String.fromCharCode(...uint8Array);
      base64 = btoa(binary);
    }
    
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    // Validate the generated data URL
    if (!/^data:image\/(png|jpeg|jpg|webp|gif|bmp|tiff);base64,/.test(dataUrl)) {
      throw new Error("Invalid data URL format generated");
    }
    
    console.log(`Base64 conversion successful. Data URL length: ${dataUrl.length}`);
    
    return dataUrl;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

/**
 * Enhanced OpenAI processing with improved error handling
 */
async function processWithOpenAI(imageUrl: string, language: string): Promise<OCRResult> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }
  
  // Validate API key first
  const isValidKey = await validateOpenAIKey(apiKey);
  if (!isValidKey) {
    throw new Error("OpenAI API key is invalid or expired");
  }
  
  console.log("Processing with OpenAI Vision API (Handwriting Specialist)");
  
  try {
    // Convert image to proper base64 format
    let processedImageUrl: string;
    
    if (imageUrl.startsWith('data:')) {
      console.log("Image is already in data URL format");
      // Validate the existing data URL format
      if (!/^data:image\/(png|jpeg|jpg|webp|gif|bmp|tiff);base64,/.test(imageUrl)) {
        throw new Error("Invalid input data URL format");
      }
      processedImageUrl = imageUrl;
    } else {
      console.log("Converting HTTP URL to base64 data URL...");
      processedImageUrl = await convertImageToBase64(imageUrl);
    }
    
    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert OCR system specialized in reading handwritten text with exceptional accuracy. 
                   Your primary focus is on handwritten notes, cursive writing, and mixed handwritten/printed content.
                   
                   HANDWRITING EXPERTISE:
                   - Excel at reading cursive handwriting, print handwriting, and mixed styles
                   - Interpret unclear letters using context clues
                   - Handle different pen types, pencil marks, and varying writing pressures
                   - Process handwritten mathematical formulas and equations
                   - Read handwritten notes in margins and annotations
                   - Handle rotated or tilted handwritten text
                   
                   EXTRACTION RULES:
                   - Extract ALL visible text with maximum accuracy
                   - Preserve original formatting and structure including line breaks
                   - Use context to interpret unclear handwritten characters
                   - For handwritten mathematical content, use proper notation
                   - If text is partially illegible, provide your best interpretation
                   - Return ONLY the extracted text, no explanations or commentary
                   
                   Language context: ${language}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please transcribe all text from this image with special focus on handwritten content. Use your expertise in handwriting recognition to provide the most accurate transcription possible:"
            },
            {
              type: "image_url",
              image_url: {
                url: processedImageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    };
    
    console.log("Sending request to OpenAI API...");
    console.log("Request body structure:", {
      model: requestBody.model,
      messagesCount: requestBody.messages.length,
      maxTokens: requestBody.max_tokens,
      imageUrlLength: processedImageUrl.length
    });
    
    // Add timeout handling (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error response:", errorData);
      
      // Parse nested error messages
      const errorMessage = errorData?.error?.message || `${response.status} ${response.statusText}`;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("OpenAI response received successfully");
    console.log("Response structure:", {
      choicesCount: data.choices?.length || 0,
      hasContent: !!data.choices?.[0]?.message?.content,
      usage: data.usage
    });
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid OpenAI response structure:", data);
      throw new Error("Invalid response from OpenAI - no choices returned");
    }
    
    const extractedText = data.choices[0].message.content?.trim();
    
    if (!extractedText) {
      throw new Error("OpenAI returned empty text content");
    }
    
    console.log(`OpenAI extracted text length: ${extractedText.length} characters`);
    console.log("First 100 characters:", extractedText.substring(0, 100));
    
    return {
      text: extractedText,
      confidence: 0.95,
      processedAt: new Date().toISOString(),
      language: language,
      provider: "openai-vision-gpt4o"
    };
  } catch (error) {
    console.error("OpenAI processing error details:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("OpenAI API request timed out after 30 seconds");
    }
    
    throw new Error(`OpenAI processing failed: ${error.message}`);
  }
}

/**
 * Google Cloud Vision processing with improved error handling
 */
async function processWithCloudOCR(imageUrl: string, language: string, enhanceImage: boolean): Promise<OCRResult> {
  const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
  
  if (!googleApiKey) {
    console.log("No Google Cloud API key found, returning fallback result");
    
    return {
      text: "No OCR services are properly configured. Please set up either OPENAI_API_KEY or GOOGLE_CLOUD_API_KEY in your Supabase secrets to enable text extraction from images.",
      confidence: 0.0,
      processedAt: new Date().toISOString(),
      language: language,
      enhancementApplied: enhanceImage,
      provider: "no-service-configured"
    };
  }
  
  try {
    console.log("Processing with Google Cloud Vision API");
    
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`;
    
    let base64Image: string;
    
    if (imageUrl.startsWith('data:')) {
      // Extract just the base64 part, removing the data URL prefix
      const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
      if (!base64Match) {
        throw new Error("Invalid data URL format for Google Vision");
      }
      base64Image = base64Match[1];
    } else {
      const dataUrl = await convertImageToBase64(imageUrl);
      const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
      if (!base64Match) {
        throw new Error("Failed to extract base64 from converted data URL");
      }
      base64Image = base64Match[1];
    }
    
    console.log(`Sending base64 image to Google Vision API, length: ${base64Image.length}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }
            ],
            imageContext: {
              languageHints: [language]
            }
          }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Google Cloud Vision API error:", error);
      throw new Error(`Google Cloud Vision API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    console.log("Google Vision API response received");
    
    const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
    const extractedText = fullTextAnnotation?.text || "No text detected in image";
    
    console.log(`Google Vision extracted text length: ${extractedText.length} characters`);
    
    return {
      text: extractedText,
      confidence: data.responses[0]?.fullTextAnnotation?.confidence || 0.7,
      processedAt: new Date().toISOString(),
      language: language,
      enhancementApplied: enhanceImage,
      provider: "google-vision-document"
    };
  } catch (error) {
    console.error("Google Cloud Vision processing error:", error);
    
    return {
      text: `OCR processing failed: ${error.message}. Please check your Google Cloud Vision API configuration and ensure the image is accessible.`,
      confidence: 0.0,
      processedAt: new Date().toISOString(),
      language: language,
      enhancementApplied: enhanceImage,
      provider: "google-vision-error"
    };
  }
}
