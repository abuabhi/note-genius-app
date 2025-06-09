
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { processWithOpenAI } from "./processors/openaiProcessor.ts";
import { processWithCloudOCR } from "./processors/googleVisionProcessor.ts";

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
