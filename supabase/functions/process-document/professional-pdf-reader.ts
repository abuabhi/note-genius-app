
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.mjs';

export interface ProfessionalPdfResult {
  text: string;
  title?: string;
  metadata?: Record<string, any>;
  pageCount: number;
  hasImages: boolean;
  textQuality: 'good' | 'poor' | 'minimal';
  processingMethod: 'pdf.js' | 'requires-ocr';
}

export async function readPdfWithPdfJs(fileContent: ArrayBuffer): Promise<ProfessionalPdfResult> {
  try {
    console.log("Starting professional PDF extraction with PDF.js");
    
    // Configure PDF.js for Deno environment - completely disable worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    
    // Initialize PDF.js with the file content
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileContent),
      verbosity: 0, // Minimize console output
      disableWorker: true, // Important for Deno environment
      useWorkerFetch: false, // Disable worker fetch
      isEvalSupported: false, // Disable eval for security
      useSystemFonts: false, // Disable system fonts
      standardFontDataUrl: null // Disable standard font loading
    });
    
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    console.log(`PDF loaded successfully. Page count: ${pageCount}`);
    
    let fullText = '';
    let hasImages = false;
    let totalTextLength = 0;
    
    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        
        // Extract text content
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        if (pageText) {
          fullText += pageText + '\n\n';
          totalTextLength += pageText.length;
        }
        
        // Check for images/graphics (simplified approach for Deno)
        try {
          const operatorList = await page.getOperatorList();
          const hasPageImages = operatorList.fnArray.some((fn: number) => 
            fn === pdfjsLib.OPS.paintImageXObject || 
            fn === pdfjsLib.OPS.paintInlineImageXObject
          );
          
          if (hasPageImages) {
            hasImages = true;
          }
        } catch (opError) {
          console.log(`Could not check for images on page ${pageNum}, continuing...`);
        }
        
        console.log(`Page ${pageNum}: ${pageText.length} characters extracted`);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        continue;
      }
    }
    
    // Clean up the extracted text
    fullText = fullText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim();
    
    // Determine text quality and processing method
    const avgTextPerPage = totalTextLength / pageCount;
    let textQuality: 'good' | 'poor' | 'minimal';
    let processingMethod: 'pdf.js' | 'requires-ocr';
    
    if (avgTextPerPage > 200) {
      textQuality = 'good';
      processingMethod = 'pdf.js';
    } else if (avgTextPerPage > 50) {
      textQuality = 'poor';
      processingMethod = 'pdf.js';
    } else {
      textQuality = 'minimal';
      processingMethod = 'requires-ocr';
    }
    
    // Generate title from content
    let title = "PDF Document";
    if (fullText.length > 10) {
      const sentences = fullText.split(/[.!?]/).filter(s => s.trim().length > 0);
      if (sentences.length > 0) {
        const firstSentence = sentences[0].trim();
        if (firstSentence.length > 5 && firstSentence.length < 80) {
          title = firstSentence;
        }
      }
    }
    
    console.log(`PDF processing completed. Method: ${processingMethod}, Quality: ${textQuality}, Text length: ${fullText.length}`);
    
    return {
      text: fullText,
      title,
      pageCount,
      hasImages,
      textQuality,
      processingMethod,
      metadata: {
        fileSize: fileContent.byteLength,
        extractionMethod: 'pdf.js',
        textLength: fullText.length,
        avgTextPerPage,
        requiresOCR: processingMethod === 'requires-ocr'
      }
    };
  } catch (error) {
    console.error("Error with PDF.js extraction:", error);
    
    return {
      text: "Failed to extract text with PDF.js. Document may be corrupted or require OCR processing.",
      title: "PDF Processing Error",
      pageCount: 0,
      hasImages: false,
      textQuality: 'minimal',
      processingMethod: 'requires-ocr',
      metadata: { 
        error: error.message,
        extractionMethod: 'pdf.js-failed'
      }
    };
  }
}
