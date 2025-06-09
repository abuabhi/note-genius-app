
import { convertImageToBase64, validateOpenAIKey } from "../utils/imageUtils.ts";

interface OCRResult {
  text: string;
  confidence: number;
  processedAt: string;
  language: string;
  enhancementApplied?: boolean;
  provider: string;
}

/**
 * Enhanced OpenAI processing with improved error handling
 */
export async function processWithOpenAI(imageUrl: string, language: string): Promise<OCRResult> {
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
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid OpenAI response structure:", data);
      throw new Error("Invalid response from OpenAI - no choices returned");
    }
    
    const extractedText = data.choices[0].message.content?.trim();
    
    if (!extractedText) {
      throw new Error("OpenAI returned empty text content");
    }
    
    console.log(`OpenAI extracted text length: ${extractedText.length} characters`);
    
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
