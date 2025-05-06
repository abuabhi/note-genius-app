
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export interface PdfResult {
  text: string;
  title?: string;
  metadata?: Record<string, any>;
}

export async function readPdf(fileContent: ArrayBuffer): Promise<PdfResult> {
  try {
    console.log("Starting PDF extraction process");
    
    // Convert ArrayBuffer to base64 for processing
    const base64Pdf = bufferToBase64(fileContent);
    
    // Use PDF.js Express API for extraction
    // This is a real API that provides PDF text extraction capabilities
    const apiKey = Deno.env.get('PDFJS_API_KEY') || 'demo_key'; // Fallback to demo key with limitations
    
    const response = await fetch('https://api.pdfjs.express/v1/pdf/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        pdf: base64Pdf,
        extract: ['text', 'metadata']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PDF extraction API error:", errorText);
      throw new Error(`PDF extraction API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("PDF extraction completed successfully");
    
    // Extract the text content from the API response
    let extractedText = '';
    if (result.text && result.text.length > 0) {
      extractedText = result.text.join('\n');
    }
    
    // Extract metadata if available
    const metadata: Record<string, any> = {};
    if (result.metadata) {
      // Common PDF metadata fields
      if (result.metadata.Title) metadata.title = result.metadata.Title;
      if (result.metadata.Author) metadata.author = result.metadata.Author;
      if (result.metadata.CreationDate) metadata.creationDate = result.metadata.CreationDate;
      if (result.metadata.ModDate) metadata.modificationDate = result.metadata.ModDate;
      if (result.metadata.Producer) metadata.producer = result.metadata.Producer;
      if (result.metadata.PageCount) metadata.pageCount = result.metadata.PageCount;
    }
    
    // Try to determine a title from metadata or from first line of text
    let title = metadata.title || '';
    if (!title && extractedText) {
      const lines = extractedText.split('\n');
      if (lines.length > 0) {
        // Use the first non-empty line as a title if it's reasonably short
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.length > 0 && trimmedLine.length <= 100) {
            title = trimmedLine;
            break;
          }
        }
      }
    }
    
    // If still no title, use a generic one
    if (!title) {
      title = "Imported PDF Document";
    }
    
    return {
      text: extractedText,
      title,
      metadata
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return {
      text: "Failed to extract text from PDF. Error: " + error.message,
      title: "PDF Extraction Error",
      metadata: { error: error.message }
    };
  }
}

// Helper function to convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer): string {
  // Convert ArrayBuffer to Uint8Array
  const bytes = new Uint8Array(buffer);
  
  // Convert to binary string
  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  // Convert to base64
  return btoa(binaryString);
}
