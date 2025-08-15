
/**
 * Image processing utilities for OCR
 */

export async function convertImageToBase64(imageUrl: string): Promise<string> {
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
    
    // Improved base64 encoding that avoids call stack overflow
    let base64: string;
    
    // Check if we're in Deno environment and Buffer is available
    if (typeof Deno !== 'undefined' && typeof Buffer !== 'undefined') {
      // Deno environment - use Buffer for better performance and safety
      console.log("Using Buffer.from() for base64 conversion");
      base64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      // Fallback - use chunk-based approach to avoid call stack overflow
      console.log("Using chunk-based base64 conversion");
      const uint8Array = new Uint8Array(arrayBuffer);
      base64 = arrayBufferToBase64Chunked(uint8Array);
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
 * Convert ArrayBuffer to base64 using chunk-based approach to avoid call stack overflow
 */
function arrayBufferToBase64Chunked(uint8Array: Uint8Array): string {
  const chunkSize = 8192; // Process 8KB at a time
  let binaryString = '';
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    const chunkArray = Array.from(chunk);
    binaryString += String.fromCharCode(...chunkArray);
  }
  
  return btoa(binaryString);
}

export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
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
