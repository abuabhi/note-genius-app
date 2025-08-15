
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
 * Enhanced OpenAI processing with improved error handling and clean Markdown formatting
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
  
  console.log("Processing with OpenAI Vision API (Handwriting Specialist + Clean Markdown)");
  
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
          content: `You are an expert OCR system specialized in reading handwritten text with exceptional accuracy and formatting it as clean, structured text.
                   
                   HANDWRITING EXPERTISE:
                   - Excel at reading cursive handwriting, print handwriting, and mixed styles
                   - Interpret unclear letters using context clues
                   - Handle different pen types, pencil marks, and varying writing pressures
                   - Process handwritten mathematical formulas and equations
                   - Read handwritten notes in margins and annotations
                   - Handle rotated or tilted handwritten text
                   
                   TEXT FORMATTING REQUIREMENTS:
                   - Output clean, readable text WITHOUT any markdown formatting
                   - Convert numbered lists (1., 2., 3.) into simple numbered format: "1. Item text"
                   - Convert bullet points or dashes into simple list format with "-" 
                   - Use line breaks for proper paragraph separation
                   - Format mathematical content with proper notation
                   - Preserve hierarchical structure and relationships
                   - Do NOT use # symbols for headers or numbering
                   - Do NOT use ** for bold text
                   - Do NOT use markdown code blocks or backticks
                   
                   CRITICAL RULES:
                   - NEVER use # symbols anywhere in the output
                   - NEVER use markdown formatting syntax
                   - Extract ALL visible text with maximum accuracy
                   - Return ONLY the clean text content - no explanations, no formatting
                   - Maintain original content structure but as plain text
                   
                   Language context: ${language}
                   
                   EXAMPLE INPUT: Handwritten "Shopping List 1. Milk 2. Bread 3. Eggs"
                   CORRECT OUTPUT:
                   Shopping List
                   
                   1. Milk
                   2. Bread
                   3. Eggs
                   
                   EXAMPLE INPUT: Handwritten "Notes - point one - point two"
                   CORRECT OUTPUT:
                   Notes
                   
                   - Point one
                   - Point two`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please transcribe all text from this image as clean, readable text. Do not use any markdown formatting. Convert handwritten lists and sections into simple numbered or bulleted lists. Remember: never use # symbols or any markdown syntax:"
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
    
    let extractedText = data.choices[0].message.content?.trim();
    
    if (!extractedText) {
      throw new Error("OpenAI returned empty text content");
    }
    
    // Enhanced post-processing to ensure no markdown formatting remains
    extractedText = extractedText
      .replace(/^```[\s\S]*?\n?/i, '')          // Remove opening code blocks
      .replace(/\n?```\s*$/i, '')               // Remove closing code blocks
      .replace(/^#{1,6}\s+/gm, '')              // Remove ALL # symbols at start of lines
      .replace(/#{1,6}\s*(\d+\.)/gm, '$1')      // Convert "# 1." to "1."
      .replace(/#{1,6}\s*(\d+\))/gm, '$1')      // Convert "# 1)" to "1)"
      .replace(/#{1,6}\s+/g, '')                // Remove any remaining # symbols with spaces
      .replace(/#{1,6}/g, '')                   // Remove any standalone # symbols
      .replace(/\*\*([^*]+)\*\*/g, '$1')        // Remove bold formatting
      .replace(/\*([^*]+)\*/g, '$1')            // Remove italic formatting
      .replace(/`([^`]+)`/g, '$1')              // Remove inline code formatting
      .trim();
    
    console.log(`OpenAI extracted and cleaned text length: ${extractedText.length} characters`);
    console.log("Text processed as clean plain text format");
    
    return {
      text: extractedText,
      confidence: 0.95,
      processedAt: new Date().toISOString(),
      language: language,
      provider: "openai-vision-gpt4o-plaintext"
    };
  } catch (error) {
    console.error("OpenAI processing error details:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("OpenAI API request timed out after 30 seconds");
    }
    
    throw new Error(`OpenAI processing failed: ${error.message}`);
  }
}
