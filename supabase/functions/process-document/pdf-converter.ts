
/**
 * PDF to Image conversion utilities for Deno runtime
 */

export interface PdfPage {
  pageNumber: number;
  imageData: string; // base64 encoded PNG
  width: number;
  height: number;
}

export interface PdfConversionResult {
  pages: PdfPage[];
  totalPages: number;
  conversionTime: number;
}

/**
 * Convert PDF buffer to PNG images using PDF.js
 */
export async function convertPdfToImages(
  pdfBuffer: ArrayBuffer,
  maxPages: number = 5
): Promise<PdfConversionResult> {
  const startTime = Date.now();
  
  try {
    // Dynamic import of PDF.js for Deno
    const pdfjs = await import('https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs');
    
    // Configure PDF.js worker
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';
    
    // Load PDF document
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0 // Reduce console noise
    }).promise;
    
    const totalPages = Math.min(pdf.numPages, maxPages);
    const pages: PdfPage[] = [];
    
    console.log(`Converting PDF with ${pdf.numPages} pages (processing first ${totalPages})`);
    
    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        
        // Create canvas for rendering
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error(`Failed to get canvas context for page ${pageNum}`);
        }
        
        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert to PNG blob
        const blob = await canvas.convertToBlob({ type: 'image/png', quality: 0.95 });
        
        // Convert to base64
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        pages.push({
          pageNumber: pageNum,
          imageData: base64,
          width: viewport.width,
          height: viewport.height
        });
        
        console.log(`Converted page ${pageNum}/${totalPages} (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
        
        // Clean up page
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Error converting page ${pageNum}:`, pageError);
        // Continue with other pages instead of failing completely
      }
    }
    
    if (pages.length === 0) {
      throw new Error('No pages could be converted from PDF');
    }
    
    const conversionTime = Date.now() - startTime;
    console.log(`PDF conversion completed: ${pages.length} pages in ${conversionTime}ms`);
    
    return {
      pages,
      totalPages: pages.length,
      conversionTime
    };
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error(`PDF conversion failed: ${error.message}`);
  }
}

/**
 * Create a combined image from multiple PDF pages
 */
export function combinePdfPages(pages: PdfPage[], maxCombinedHeight: number = 4000): string {
  if (pages.length === 0) {
    throw new Error('No pages to combine');
  }
  
  if (pages.length === 1) {
    return pages[0].imageData;
  }
  
  // For multiple pages, we'll return the first page as primary
  // and mention in the text that it's a multi-page document
  console.log(`Using first page of ${pages.length} pages for OCR processing`);
  return pages[0].imageData;
}
