// This file contains utility functions for OCR processing

import { createWorker } from 'tesseract.js';

/**
 * Process an image with OCR to extract text
 * @param imageUrl URL or base64 string of the image to process
 * @param language Language code for OCR (e.g., 'eng', 'fra', 'spa')
 * @returns Promise resolving to the extracted text and confidence score
 */
export const processImageWithOCR = async (
  imageUrl: string, 
  language: string = 'eng'
): Promise<{ text: string; confidence: number }> => {
  try {
    const worker = await createWorker(language);
    const { data } = await worker.recognize(imageUrl);
    await worker.terminate();
    
    return { 
      text: data.text, 
      confidence: data.confidence / 100 // Convert to 0-1 scale
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(`OCR processing failed: ${(error as Error).message}`);
  }
};

/**
 * Enhance image before OCR processing
 * @param imageUrl URL or base64 string of the image
 * @returns Promise resolving to the enhanced image URL
 */
export const enhanceImage = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl);
        return;
      }
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Apply contrast enhancement and thresholding
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and apply adaptive thresholding
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Apply simple thresholding (improve contrast)
        const threshold = 128;
        const value = gray > threshold ? 255 : 0;
        
        // Set RGB values
        data[i] = value;      // R
        data[i + 1] = value;  // G
        data[i + 2] = value;  // B
        // Keep alpha channel as is
      }
      
      // Put the processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to data URL
      const enhancedImageUrl = canvas.toDataURL('image/png');
      resolve(enhancedImageUrl);
    };
    
    img.onerror = () => {
      console.error('Error loading image for enhancement');
      resolve(imageUrl);
    };
    
    img.src = imageUrl;
  });
};

/**
 * Resize an image for better OCR processing
 * @param imageUrl URL or base64 string of the image
 * @param maxWidth Maximum width of the resized image
 * @returns Promise resolving to the resized image URL
 */
export const resizeImage = async (imageUrl: string, maxWidth: number = 1200): Promise<string> => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve("");
      return;
    }
    
    // Create an offscreen image to calculate dimensions
    const img = new Image();
    img.onload = () => {
      // Only resize if the image is larger than maxWidth
      if (img.width <= maxWidth) {
        resolve(imageUrl);
        return;
      }
      
      // Calculate new height to maintain aspect ratio
      const aspectRatio = img.height / img.width;
      const newWidth = maxWidth;
      const newHeight = Math.round(newWidth * aspectRatio);
      
      // Create a canvas and resize
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageUrl);
        return;
      }
      
      // Draw resized image to canvas
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert to base64
      const resizedImageUrl = canvas.toDataURL("image/jpeg", 0.92);
      resolve(resizedImageUrl);
    };
    
    img.onerror = () => {
      // If there's an error loading the image, return the original
      console.error("Error loading image for resize");
      resolve(imageUrl);
    };
    
    img.src = imageUrl;
  });
};

/**
 * Get available languages for OCR
 * @returns Array of available language options for the OCR engine
 */
export const getAvailableOCRLanguages = (): { code: string; name: string }[] => {
  return [
    { code: "eng", name: "English" },
    { code: "fra", name: "French" },
    { code: "spa", name: "Spanish" },
    { code: "deu", name: "German" },
    { code: "chi_sim", name: "Chinese (Simplified)" },
    { code: "jpn", name: "Japanese" },
    { code: "ita", name: "Italian" },
    { code: "por", name: "Portuguese" },
    { code: "rus", name: "Russian" },
    { code: "ara", name: "Arabic" }
  ];
};
