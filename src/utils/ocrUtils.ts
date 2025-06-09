
// Enhanced OCR utility functions with better handwriting support

import { createWorker, PSM, OEM } from 'tesseract.js';

/**
 * Enhanced image preprocessing specifically for handwritten text
 */
export const enhanceImageForHandwriting = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl);
        return;
      }
      
      // Set canvas dimensions with upscaling for better OCR
      const scale = 2; // Upscale for better recognition
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply enhanced preprocessing for handwriting
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Enhanced preprocessing pipeline
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale with better weights for text
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Apply adaptive contrast enhancement
        const enhanced = gray < 140 ? Math.max(0, gray - 20) : Math.min(255, gray + 30);
        
        // Apply slight sharpening for handwritten text
        const sharpened = Math.min(255, Math.max(0, enhanced * 1.2));
        
        // Set RGB values
        data[i] = sharpened;      // R
        data[i + 1] = sharpened;  // G
        data[i + 2] = sharpened;  // B
        // Keep alpha channel as is
      }
      
      // Put the processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to data URL with high quality
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
 * Enhanced OCR processing with better handwriting recognition
 */
export const processImageWithOCR = async (
  imageUrl: string, 
  language: string = 'eng'
): Promise<{ text: string; confidence: number }> => {
  try {
    // Create worker with enhanced settings for handwriting
    const worker = await createWorker({
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      logger: m => console.log(m)
    });
    
    await worker.loadLanguage(language);
    await worker.initialize(language);
    
    // Configure Tesseract for better handwriting recognition
    await worker.setParameters({
      tessedit_char_whitelist: '',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Use PSM enum instead of string
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY // Use OEM enum instead of string
    });
    
    const { data } = await worker.recognize(imageUrl);
    await worker.terminate();
    
    return { 
      text: data.text, 
      confidence: data.confidence / 100
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
