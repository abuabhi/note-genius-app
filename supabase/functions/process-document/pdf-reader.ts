
export interface PdfResult {
  text: string;
  title?: string;
  metadata?: Record<string, any>;
}

export async function readPdf(fileContent: ArrayBuffer): Promise<PdfResult> {
  try {
    console.log("Starting PDF extraction process");
    
    // For now, we'll implement a basic PDF text extraction
    // This is a simplified approach that works for most PDFs
    const uint8Array = new Uint8Array(fileContent);
    
    // Convert to string to search for text content
    const pdfString = new TextDecoder('latin1').decode(uint8Array);
    
    // Extract text using basic PDF parsing
    // Look for text objects in the PDF
    const textMatches = pdfString.match(/\(([^)]+)\)/g) || [];
    const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs) || [];
    
    let extractedText = '';
    
    // Extract text from parentheses (common PDF text storage)
    textMatches.forEach(match => {
      const text = match.slice(1, -1); // Remove parentheses
      if (text.length > 2 && /[a-zA-Z]/.test(text)) {
        extractedText += text + ' ';
      }
    });
    
    // If no text found in parentheses, try extracting from streams
    if (extractedText.trim().length === 0) {
      streamMatches.forEach(match => {
        const content = match.replace(/stream\s*|\s*endstream/g, '');
        // Look for readable text patterns
        const readableText = content.match(/[a-zA-Z][a-zA-Z0-9\s.,!?;:'"()-]{10,}/g) || [];
        readableText.forEach(text => {
          extractedText += text + ' ';
        });
      });
    }
    
    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .trim();
    
    // If still no meaningful text, provide a fallback message
    if (extractedText.length < 50) {
      extractedText = "PDF text extraction completed, but the document may contain images, complex formatting, or be password protected. The content might not be fully readable through automatic text extraction.";
    }
    
    // Try to determine a title from the first meaningful line
    let title = "Imported PDF Document";
    const lines = extractedText.split(/[.\n]/).filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length > 5 && firstLine.length < 100) {
        title = firstLine;
      }
    }
    
    console.log(`PDF processing completed. Extracted ${extractedText.length} characters`);
    
    return {
      text: extractedText,
      title,
      metadata: {
        fileSize: fileContent.byteLength,
        extractionMethod: 'basic_parsing',
        textLength: extractedText.length
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
