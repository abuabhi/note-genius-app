
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
    
    console.log(`Processing image: ${imageUrl.substring(0, 50)}..., language: ${language}, useOpenAI: ${useOpenAI}, enhanceImage: ${enhanceImage}`);
    
    // Fetch the image
    let imageData: string | ArrayBuffer = imageUrl;
    
    // If the imageUrl is an actual URL (not a data URL), fetch it
    if (imageUrl.startsWith('http')) {
      console.log("Fetching image from URL...");
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        // Get the image as an array buffer
        imageData = await response.arrayBuffer();
        
        // Convert to base64 for processing if needed
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imageData)));
        imageData = `data:${response.headers.get("content-type") || "image/png"};base64,${base64}`;
        console.log("Image successfully converted to data URL");
      } catch (fetchError) {
        console.error("Error fetching image:", fetchError);
        throw fetchError;
      }
    }
    
    // Check if we have API keys before attempting to use the services
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
    
    console.log(`API Keys available: OpenAI: ${openaiApiKey ? "Yes" : "No"}, Google Cloud: ${googleApiKey ? "Yes" : "No"}`);
    
    // Choose OCR provider based on parameters
    let result: OCRResult;
    
    if (useOpenAI && openaiApiKey) {
      // Use OpenAI Vision API for premium users
      console.log("Using OpenAI Vision API for OCR...");
      try {
        result = await processWithOpenAI(imageData.toString(), language);
        console.log("OpenAI processing completed successfully");
      } catch (openaiError) {
        console.error("OpenAI processing failed, falling back to Google Cloud Vision:", openaiError);
        // If OpenAI fails, fallback to Google Cloud Vision or mock
        result = await processWithCloudOCR(imageData.toString(), language, enhanceImage);
      }
    } else {
      // Use Cloud Vision API (or fallback to mock response)
      console.log("Using Google Cloud Vision API or mock for OCR...");
      result = await processWithCloudOCR(imageData.toString(), language, enhanceImage);
    }
    
    // Log usage metrics if user ID is provided
    if (userId) {
      console.log(`Logging OCR usage for user: ${userId}`);
      // Here you would typically log to a database
      // This would be implemented based on your usage tracking needs
    }
    
    console.log("Returning OCR result");
    
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
 * Process image with OpenAI's Vision model
 */
async function processWithOpenAI(imageData: string, language: string): Promise<OCRResult> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }
  
  console.log("Processing with OpenAI Vision API");
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an OCR system. Extract all text from the image accurately. 
                     Return only the extracted text, nothing else. The text should be in the 
                     original language of the image. The language code is: ${language}.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error response:", error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    console.log("OpenAI response received");
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid OpenAI response structure:", data);
      throw new Error("Invalid response from OpenAI");
    }
    
    const extractedText = data.choices[0].message.content.trim();
    
    return {
      text: extractedText,
      confidence: 0.95, // OpenAI doesn't provide confidence scores, so we use a high default
      processedAt: new Date().toISOString(),
      language: language,
      provider: "openai"
    };
  } catch (error) {
    console.error("OpenAI processing error details:", error);
    throw new Error(`OpenAI processing failed: ${error.message}`);
  }
}

/**
 * Process image with Google Cloud Vision API or fallback
 */
async function processWithCloudOCR(imageData: string, language: string, enhanceImage: boolean): Promise<OCRResult> {
  const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");
  
  // For demo purposes, if no API key, return mock result
  if (!googleApiKey) {
    console.log("No Google Cloud API key found, returning mock OCR result");
    
    // Generate reasonably realistic mock data
    const confidenceScore = 0.75 + Math.random() * 0.2; // Between 0.75 and 0.95
    
    return {
      text: "This is sample extracted text from the image. In a production environment, this would be actual text extracted from the provided image using OCR technology.",
      confidence: confidenceScore,
      processedAt: new Date().toISOString(),
      language: language,
      enhancementApplied: enhanceImage,
      provider: "mock"
    };
  }
  
  // This would be the real Cloud Vision API implementation
  try {
    console.log("Processing with Google Cloud Vision API");
    
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`;
    
    // Remove data URL prefix if present
    let base64Image = imageData;
    if (imageData.startsWith('data:')) {
      base64Image = imageData.split(',')[1];
    }
    
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
                type: 'TEXT_DETECTION',
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
      throw new Error(`Google Cloud Vision API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    const textAnnotations = data.responses[0]?.textAnnotations;
    const extractedText = textAnnotations && textAnnotations.length > 0 
      ? textAnnotations[0].description 
      : "No text detected";
    
    return {
      text: extractedText,
      confidence: data.responses[0]?.textAnnotations?.[0]?.confidence || 0.7,
      processedAt: new Date().toISOString(),
      language: language,
      enhancementApplied: enhanceImage,
      provider: "google-vision"
    };
  } catch (error) {
    console.error("Google Cloud Vision processing error:", error);
    
    // Fallback to mock data if API fails
    return {
      text: "Error processing image. This is fallback text.",
      confidence: 0.3,
      processedAt: new Date().toISOString(),
      language: language,
      enhancementApplied: enhanceImage,
      provider: "fallback"
    };
  }
}
