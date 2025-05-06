
import * as zip from "https://deno.land/x/zipjs@v2.6.52/index.js";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export interface DocxResult {
  text: string;
  title?: string;
  metadata?: Record<string, any>;
}

export async function readDocx(fileContent: ArrayBuffer): Promise<DocxResult> {
  try {
    console.log("Starting DOCX extraction process");
    
    // DOCX files are ZIP archives containing XML files
    // Create a zip reader from the array buffer
    const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(fileContent)));
    
    // Extract all entries from the zip
    const entries = await zipReader.getEntries();
    
    // Initialize variables to store document content and metadata
    let documentText = '';
    const metadata: Record<string, any> = {};
    let title = '';
    
    // Process the content of document.xml which contains the main text
    const documentEntry = entries.find(entry => entry.filename === "word/document.xml");
    if (documentEntry) {
      const documentXml = await documentEntry.getData(new zip.TextWriter());
      documentText = extractTextFromDocumentXml(documentXml);
    }
    
    // Extract core properties (metadata) from docProps/core.xml
    const corePropsEntry = entries.find(entry => entry.filename === "docProps/core.xml");
    if (corePropsEntry) {
      const coreXml = await corePropsEntry.getData(new zip.TextWriter());
      const coreMetadata = extractMetadataFromCoreXml(coreXml);
      Object.assign(metadata, coreMetadata);
      
      // Use title from metadata if available
      if (coreMetadata.title) {
        title = coreMetadata.title;
      }
    }
    
    // Extract app properties from docProps/app.xml
    const appPropsEntry = entries.find(entry => entry.filename === "docProps/app.xml");
    if (appPropsEntry) {
      const appXml = await appPropsEntry.getData(new zip.TextWriter());
      const appMetadata = extractMetadataFromAppXml(appXml);
      Object.assign(metadata, appMetadata);
    }
    
    // Close the zip reader
    await zipReader.close();
    
    // If no title was found in metadata, try to extract from first line of content
    if (!title && documentText) {
      const lines = documentText.split('\n');
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
    
    // If still no title, use generic one
    if (!title) {
      title = "Imported Word Document";
    }
    
    console.log("DOCX extraction completed successfully");
    
    return {
      text: documentText,
      title,
      metadata
    };
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    return {
      text: "Failed to extract text from Word document. Error: " + error.message,
      title: "DOCX Extraction Error",
      metadata: { error: error.message }
    };
  }
}

// Helper function to extract text from document.xml
function extractTextFromDocumentXml(xml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    
    // If parsing failed, return empty string
    if (!doc) return "";
    
    // Extract text from all <w:t> elements which contain the actual text
    const textElements = doc.querySelectorAll("w\\:t");
    let text = '';
    
    for (let i = 0; i < textElements.length; i++) {
      const textElement = textElements[i];
      text += textElement.textContent;
      
      // Check if we need to add a space or line break based on the parent element
      const parent = textElement.parentElement;
      if (parent && parent.tagName === "w:r") {
        const nextSibling = parent.nextElementSibling;
        if (nextSibling && nextSibling.tagName === "w:r") {
          // Check if there's a line break or paragraph end
          const isLineBreak = nextSibling.querySelector("w\\:br") !== null;
          const isParagraphEnd = parent.parentElement && 
                               parent.parentElement.nextElementSibling && 
                               parent.parentElement.nextElementSibling.tagName === "w:p";
          
          if (isLineBreak || isParagraphEnd) {
            text += '\n';
          } else {
            text += ' ';
          }
        }
      }
    }
    
    return text.trim();
  } catch (error) {
    console.error("Error extracting text from XML:", error);
    return "Error extracting text from document";
  }
}

// Helper function to extract metadata from core.xml
function extractMetadataFromCoreXml(xml: string): Record<string, any> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    
    if (!doc) return {};
    
    const metadata: Record<string, any> = {};
    
    // Common metadata elements in core.xml
    const metadataFields = [
      "dc:title",
      "dc:creator",
      "dc:description",
      "dc:subject",
      "cp:lastModifiedBy",
      "dcterms:created",
      "dcterms:modified"
    ];
    
    for (const field of metadataFields) {
      const element = doc.querySelector(field);
      if (element && element.textContent) {
        // Convert field name to camelCase for consistent object properties
        const fieldName = field.split(':')[1].replace(/^(.)/, (match) => match.toLowerCase());
        metadata[fieldName] = element.textContent.trim();
      }
    }
    
    return metadata;
  } catch (error) {
    console.error("Error extracting core metadata:", error);
    return {};
  }
}

// Helper function to extract metadata from app.xml
function extractMetadataFromAppXml(xml: string): Record<string, any> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    
    if (!doc) return {};
    
    const metadata: Record<string, any> = {};
    
    // Common metadata elements in app.xml
    const metadataFields = [
      "Application",
      "AppVersion",
      "Company",
      "Words",
      "Characters",
      "Pages",
      "Paragraphs"
    ];
    
    for (const field of metadataFields) {
      const element = doc.querySelector(field);
      if (element && element.textContent) {
        const fieldName = field.charAt(0).toLowerCase() + field.slice(1);
        metadata[fieldName] = element.textContent.trim();
      }
    }
    
    return metadata;
  } catch (error) {
    console.error("Error extracting app metadata:", error);
    return {};
  }
}
