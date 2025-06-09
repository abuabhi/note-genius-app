
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
    
    // Use a simpler approach - convert the PDF to images using a canvas-based approach
    // For Deno environment, we'll use a different strategy
    
    // Import PDF.js with proper Deno configuration
    const pdfjsLib = await import('https://esm.sh/pdfjs-dist@3.11.174/build/pdf.min.mjs');
    
    // Configure PDF.js for server environment
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
    
    // Create document loading task
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileContent),
      verbosity: 0,
      disableWorker: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
      useSystemFonts: false,
      standardFontDataUrl: null,
      cMapUrl: null,
      cMapPacked: false
    });
    
    const pdf = await loadingTask.promise;
    const pageCount = Math.min(pdf.numPages, maxPages);
    const images: string[] = [];
    
    console.log(`Processing ${pageCount} pages from PDF`);
    
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${pageCount}`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Calculate scale to achieve target width
        const scale = Math.min(targetWidth / viewport.width, 2.0); // Max scale of 2.0
        const scaledViewport = page.getViewport({ scale });
        
        // Create an OffscreenCanvas for server-side rendering
        const canvas = new OffscreenCanvas(
          Math.floor(scaledViewport.width), 
          Math.floor(scaledViewport.height)
        );
        
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Failed to get 2D context from OffscreenCanvas');
        }
        
        // Set white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          enableWebGL: false
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to blob and then to base64
        const blob = await canvas.convertToBlob({ 
          type: 'image/png', 
          quality: 0.95 
        });
        
        // Convert blob to base64
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binaryString);
        
        images.push(`data:image/png;base64,${base64}`);
        console.log(`Successfully converted page ${pageNum} to image (${base64.length} chars)`);
        
      } catch (pageError) {
        console.error(`Error converting page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
        continue;
      }
    }
    
    if (images.length === 0) {
      throw new Error('No pages could be converted to images');
    }
    
    console.log(`Successfully converted ${images.length} pages to images`);
    
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
      error: error.message || 'Unknown error during PDF to image conversion'
    };
  }
}
