
import { convertImageToBase64 } from "../utils/imageUtils.ts";

interface OCRResult {
  text: string;
  confidence: number;
  processedAt: string;
  language: string;
  enhancementApplied?: boolean;
  provider: string;
}

/**
 * Google Cloud Vision processing with improved error handling
 */
export async function processWithCloudOCR(imageUrl: string, language: string, enhanceImage: boolean): Promise<OCRResult> {
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
