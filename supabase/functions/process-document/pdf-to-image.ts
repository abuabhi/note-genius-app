
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.mjs';

export interface PdfToImageResult {
  images: string[]; // Base64 encoded images
  pageCount: number;
  success: boolean;
  error?: string;
}

export async function convertPdfToImages(
  fileContent: ArrayBuffer, 
  maxPages: number = 10,
  targetWidth: number = 1200
): Promise<PdfToImageResult> {
  try {
    console.log("Converting PDF pages to images for OCR processing");
    
    // Configure PDF.js for Deno environment - completely disable worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileContent),
      verbosity: 0,
      disableWorker: true,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: false,
      standardFontDataUrl: null
    });
    
    const pdf = await loadingTask.promise;
    const pageCount = Math.min(pdf.numPages, maxPages);
    const images: string[] = [];
    
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Calculate scale to achieve target width
        const scale = targetWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        
        // Create canvas
        const canvas = new OffscreenCanvas(scaledViewport.width, scaledViewport.height);
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }
        
        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };
        
        await page.render(renderContext).promise;
        
        // Convert to base64
        const blob = await canvas.convertToBlob({ type: 'image/png', quality: 0.9 });
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        images.push(`data:image/png;base64,${base64}`);
        console.log(`Converted page ${pageNum} to image`);
        
      } catch (pageError) {
        console.error(`Error converting page ${pageNum}:`, pageError);
        continue;
      }
    }
    
    return {
      images,
      pageCount: images.length,
      success: true
    };
    
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    return {
      images: [],
      pageCount: 0,
      success: false,
      error: error.message
    };
  }
}
