
import { toast } from "sonner";

export interface GoogleDocContent {
  id: string;
  title: string;
  content: string;
  plainText: string;
}

export interface ImportResult {
  success: boolean;
  document: GoogleDocContent;
  error?: string;
}

export class GoogleDocsImporter {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async importDocuments(documentIds: string[]): Promise<ImportResult[]> {
    const results: ImportResult[] = [];
    
    for (const docId of documentIds) {
      try {
        console.log(`🔄 Importing document: ${docId}`);
        
        const content = await this.fetchDocumentContent(docId);
        results.push({
          success: true,
          document: content
        });
        
        console.log(`✅ Successfully imported: ${content.title}`);
      } catch (error) {
        console.error(`❌ Failed to import document ${docId}:`, error);
        results.push({
          success: false,
          document: { id: docId, title: 'Unknown Document', content: '', plainText: '' },
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  private async fetchDocumentContent(documentId: string): Promise<GoogleDocContent> {
    // Fetch document metadata first
    const metadataUrl = `https://www.googleapis.com/drive/v3/files/${documentId}?fields=id,name`;
    
    const metadataResponse = await fetch(metadataUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch document metadata: ${metadataResponse.statusText}`);
    }

    const metadata = await metadataResponse.json();

    // Export document as plain text
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=text/plain`;
    
    const contentResponse = await fetch(exportUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!contentResponse.ok) {
      throw new Error(`Failed to fetch document content: ${contentResponse.statusText}`);
    }

    const plainText = await contentResponse.text();

    // Also try to get HTML content for better formatting
    let htmlContent = '';
    try {
      const htmlUrl = `https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=text/html`;
      const htmlResponse = await fetch(htmlUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (htmlResponse.ok) {
        htmlContent = await htmlResponse.text();
      }
    } catch (error) {
      console.warn('Could not fetch HTML content, using plain text only');
    }

    return {
      id: documentId,
      title: metadata.name || 'Untitled Document',
      content: htmlContent || plainText,
      plainText: plainText
    };
  }
}
