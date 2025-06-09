
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
