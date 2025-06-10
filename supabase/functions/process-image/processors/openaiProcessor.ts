
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
 * Enhanced OpenAI processing with improved error handling and Markdown formatting
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
  
  console.log("Processing with OpenAI Vision API (Handwriting Specialist + Markdown Formatter)");
  
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
          content: `You are an expert OCR system specialized in reading handwritten text with exceptional accuracy AND formatting it as clean, structured Markdown.
                   
                   HANDWRITING EXPERTISE:
                   - Excel at reading cursive handwriting, print handwriting, and mixed styles
                   - Interpret unclear letters using context clues
                   - Handle different pen types, pencil marks, and varying writing pressures
                   - Process handwritten mathematical formulas and equations
                   - Read handwritten notes in margins and annotations
                   - Handle rotated or tilted handwritten text
                   
                   MARKDOWN FORMATTING REQUIREMENTS:
                   - Convert ALL text to properly structured Markdown
                   - Transform numbered lists (1., 2., 3.) into Markdown numbered lists (1. 2. 3.)
                   - Convert bullet points or dashes into Markdown bullets (- )
                   - Format section headers with appropriate # ## ### levels
                   - Use **bold** for emphasis where handwriting indicates importance
                   - Use proper line spacing between sections (blank lines)
                   - Format mathematical content with proper notation
                   - Preserve hierarchical structure and relationships
                   
                   EXTRACTION & FORMATTING RULES:
                   - Extract ALL visible text with maximum accuracy
                   - Output ONLY properly formatted Markdown - no explanations
                   - Maintain original content structure but enhance with Markdown syntax
                   - Use context to interpret unclear handwritten characters
                   - For lists, ensure proper Markdown list formatting with blank lines
                   - For headers/titles, use appropriate # levels based on hierarchy
                   - Add blank lines between different sections or topics
                   - If mathematical content exists, format it clearly
                   
                   Language context: ${language}
                   
                   EXAMPLE INPUT: Handwritten numbered list "1. First item 2. Second item"
                   EXAMPLE OUTPUT:
                   1. First item
                   2. Second item
                   
                   EXAMPLE INPUT: Handwritten title and bullets "My Notes - point one - point two"
                   EXAMPLE OUTPUT:
                   # My Notes
                   
                   - Point one
                   - Point two`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please transcribe all text from this image and format it as clean, structured Markdown. Pay special attention to converting handwritten lists, headers, and sections into proper Markdown syntax. Preserve the original meaning while enhancing readability through proper Markdown formatting:"
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
    
    console.log(`OpenAI extracted and formatted text length: ${extractedText.length} characters`);
    console.log("Text formatted as Markdown with proper structure");
    
    return {
      text: extractedText,
      confidence: 0.95,
      processedAt: new Date().toISOString(),
      language: language,
      provider: "openai-vision-gpt4o-markdown"
    };
  } catch (error) {
    console.error("OpenAI processing error details:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("OpenAI API request timed out after 30 seconds");
    }
    
    throw new Error(`OpenAI processing failed: ${error.message}`);
  }
}
