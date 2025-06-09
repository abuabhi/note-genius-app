
export interface PdfResult {
  text: string;
  title?: string;
  metadata?: Record<string, any>;
}

export async function readPdf(fileContent: ArrayBuffer): Promise<PdfResult> {
  try {
    console.log("Starting improved PDF extraction process");
    
    const uint8Array = new Uint8Array(fileContent);
    const pdfString = new TextDecoder('latin1').decode(uint8Array);
    
    let extractedText = '';
    
    // Method 1: Extract text from BT/ET blocks (text objects)
    const textBlocks = pdfString.match(/BT\s*(.*?)\s*ET/gs) || [];
    console.log(`Found ${textBlocks.length} text blocks`);
    
    for (const block of textBlocks) {
      // Look for text in parentheses within text blocks
      const textMatches = block.match(/\(([^)]*)\)/g) || [];
      for (const match of textMatches) {
        let text = match.slice(1, -1); // Remove parentheses
        
        // Filter out non-text content
        if (text.length > 1 && 
            /[a-zA-Z]/.test(text) && 
            !text.includes('uuid:') &&
            !text.includes('MSIP_') &&
            !text.includes('Adobe') &&
            text.length < 200) { // Avoid very long encoded strings
          
          // Clean up the text
          text = text
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
            .trim();
          
          if (text.length > 2) {
            extractedText += text + ' ';
          }
        }
      }
    }
    
    // Method 2: If no text blocks found, try Tj operations
    if (extractedText.length < 50) {
      console.log("Trying Tj operations for text extraction");
      
      const tjMatches = pdfString.match(/\(([^)]+)\)\s*Tj/g) || [];
      for (const match of tjMatches) {
        let text = match.replace(/\(([^)]+)\)\s*Tj/, '$1');
        
        if (text.length > 1 && 
            /[a-zA-Z]/.test(text) && 
            !text.includes('uuid:') &&
            !text.includes('MSIP_') &&
            text.length < 100) {
          
          text = text
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .trim();
          
          if (text.length > 2) {
            extractedText += text + ' ';
          }
        }
      }
    }
    
    // Method 3: Extract from stream content (fallback)
    if (extractedText.length < 50) {
      console.log("Trying stream content extraction");
      
      const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs) || [];
      for (const streamMatch of streamMatches) {
        const content = streamMatch.replace(/stream\s*|\s*endstream/g, '');
        
        // Look for readable text patterns in streams
        const readableTexts = content.match(/[A-Za-z][A-Za-z0-9\s.,!?;:'"()-]{8,50}/g) || [];
        for (const text of readableTexts) {
          if (!text.includes('uuid:') && 
              !text.includes('MSIP_') && 
              !text.includes('Adobe') &&
              !text.includes('Filter') &&
              !text.includes('FlateDecode')) {
            extractedText += text.trim() + ' ';
          }
        }
      }
    }
    
    // Clean up the final extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters except newlines
      .replace(/Microsoft Word for Microsoft 365/g, '') // Remove software references
      .replace(/Adobe Identity/g, '') // Remove Adobe references
      .replace(/[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}/g, '') // Remove UUIDs
      .replace(/\b[A-Fa-f0-9]{32,}\b/g, '') // Remove long hex strings
      .replace(/true\s+2025-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\s+Standard/g, '') // Remove timestamp patterns
      .trim();
    
    // If still no meaningful text, provide a more helpful message
    if (extractedText.length < 20) {
      extractedText = "This PDF appears to contain mostly images, complex formatting, or encoded content that cannot be extracted as plain text. The document might be image-based or use advanced formatting that requires specialized PDF processing.";
    }
    
    // Try to determine a title from the first meaningful sentence
    let title = "Imported PDF Document";
    const sentences = extractedText.split(/[.!?]/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 5 && firstSentence.length < 80) {
        title = firstSentence;
      }
    }
    
    console.log(`PDF processing completed. Extracted ${extractedText.length} characters of readable text`);
    
    return {
      text: extractedText,
      title,
      metadata: {
        fileSize: fileContent.byteLength,
        extractionMethod: 'improved_text_filtering',
        textLength: extractedText.length,
        extractionQuality: extractedText.length > 100 ? 'good' : extractedText.length > 20 ? 'partial' : 'poor'
      }
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return {
      text: "Failed to extract text from PDF. The document may be password protected, contain only images, or use complex formatting that requires specialized processing.",
      title: "PDF Processing Error",
      metadata: { error: error.message }
    };
  }
}
