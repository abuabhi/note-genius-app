
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
          content: `You are an expert OCR system specialized in reading handwritten text with exceptional accuracy and formatting it as clean, structured Markdown.
                   
                   HANDWRITING EXPERTISE:
                   - Excel at reading cursive handwriting, print handwriting, and mixed styles
                   - Interpret unclear letters using context clues
                   - Handle different pen types, pencil marks, and varying writing pressures
                   - Process handwritten mathematical formulas and equations
                   - Read handwritten notes in margins and annotations
                   - Handle rotated or tilted handwritten text
                   
                   MARKDOWN FORMATTING REQUIREMENTS:
                   - Output ONLY clean, properly formatted Markdown - NO code blocks, NO backticks, NO \`\`\`markdown wrapper
                   - Transform numbered lists (1., 2., 3.) into proper Markdown: 1. 2. 3.
                   - Convert bullet points or dashes into Markdown bullets: - 
                   - Format section headers with appropriate # ## ### levels based on hierarchy
                   - Use **bold** for emphasis where handwriting indicates importance (underlined, circled, or heavy text)
                   - Use proper line spacing between sections (blank lines)
                   - Format mathematical content with proper notation
                   - Preserve hierarchical structure and relationships
                   
                   OUTPUT RULES:
                   - Extract ALL visible text with maximum accuracy
                   - Return ONLY the formatted Markdown content - no explanations, no code block wrapper
                   - Maintain original content structure but enhance with proper Markdown syntax
                   - Use context to interpret unclear handwritten characters
                   - For lists, ensure proper Markdown formatting with appropriate spacing
                   - For headers/titles, use # levels based on visual hierarchy and importance
                   - Add blank lines between different sections or topics for readability
                   - If mathematical content exists, format it clearly and readably
                   
                   Language context: ${language}
                   
                   EXAMPLE INPUT: Handwritten "My Notes 1. First item 2. Second item"
                   EXAMPLE OUTPUT:
                   # My Notes
                   
                   1. First item
                   2. Second item
                   
                   EXAMPLE INPUT: Handwritten "Important - point one - point two"
                   EXAMPLE OUTPUT:
                   # Important
                   
                   - Point one
                   - Point two`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please transcribe all text from this image and format it as clean, structured Markdown. Return ONLY the formatted Markdown content without any code block wrappers. Convert handwritten lists, headers, and sections into proper Markdown syntax while preserving the original meaning and structure:"
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
    
    // Post-process to clean up any remaining code block wrappers
    extractedText = extractedText
      .replace(/^```markdown\s*\n?/i, '')  // Remove opening markdown code block
      .replace(/\n?```\s*$/i, '')          // Remove closing code block
      .replace(/^```\s*\n?/i, '')          // Remove any generic opening code block
      .trim();
    
    console.log(`OpenAI extracted and cleaned text length: ${extractedText.length} characters`);
    console.log("Text processed as clean Markdown format");
    
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
