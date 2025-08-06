import { DocumentItem } from '@/components/notes/import/DocumentImportManager';

export interface OneNotePageContent {
  id: string;
  title: string;
  content: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

export const fetchOneNoteDocuments = async (accessToken: string): Promise<DocumentItem[]> => {
  console.log('🔍 [ONENOTE] Fetching OneNote pages...');
  
  const response = await fetch('https://graph.microsoft.com/v1.0/me/onenote/pages?$select=id,title,createdDateTime,lastModifiedDateTime&$top=50&$orderby=lastModifiedDateTime desc', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OneNote API error response:', errorText);
    throw new Error(`Failed to fetch OneNote pages: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('OneNote API response data:', data);
  
  if (!data.value || !Array.isArray(data.value)) {
    console.log('No pages in response or unexpected format:', data);
    return [];
  }

  return data.value.map((page: any) => ({
    id: page.id,
    name: page.title || 'Untitled Page',
    createdTime: page.createdDateTime,
    modifiedTime: page.lastModifiedDateTime,
    originalData: page
  }));
};

export const importOneNoteDocuments = async (
  documents: DocumentItem[],
  accessToken: string,
  onSaveNote: (note: any) => Promise<boolean>
): Promise<void> => {
  console.log(`🚀 [ONENOTE] Starting import of ${documents.length} documents`);

  let successCount = 0;
  let failureCount = 0;

  for (const doc of documents) {
    try {
      console.log(`📄 [ONENOTE] Processing document: ${doc.name}`);
      
      // Fetch the page content
      const contentResponse = await fetch(`https://graph.microsoft.com/v1.0/me/onenote/pages/${doc.id}/content`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!contentResponse.ok) {
        throw new Error(`Failed to fetch page content: ${contentResponse.statusText}`);
      }

      const htmlContent = await contentResponse.text();
      
      // Process the HTML content to extract plain text
      const plainText = extractTextFromHtml(htmlContent);
      
      if (!plainText.trim()) {
        console.warn(`⚠️ [ONENOTE] Page "${doc.name}" appears to be empty, skipping`);
        continue;
      }

      // Create note object
      const note = {
        title: doc.name || 'Imported OneNote Page',
        content: plainText,
        subject: 'OneNote Import',
        tags: ['imported', 'onenote'],
        source: 'onenote_import',
        metadata: {
          originalId: doc.id,
          createdTime: doc.createdTime,
          modifiedTime: doc.modifiedTime,
          importedAt: new Date().toISOString()
        }
      };

      const success = await onSaveNote(note);
      if (success) {
        successCount++;
        console.log(`✅ [ONENOTE] Successfully imported: ${doc.name}`);
      } else {
        failureCount++;
        console.error(`❌ [ONENOTE] Failed to save note: ${doc.name}`);
      }

    } catch (error) {
      failureCount++;
      console.error(`❌ [ONENOTE] Error processing document "${doc.name}":`, error);
    }
  }

  console.log(`📊 [ONENOTE] Import completed: ${successCount} success, ${failureCount} failed`);
  
  if (failureCount > 0 && successCount === 0) {
    throw new Error(`Failed to import any documents (${failureCount} failures)`);
  } else if (failureCount > 0) {
    throw new Error(`Partially successful: ${successCount} imported, ${failureCount} failed`);
  }
};

// Helper function to extract plain text from HTML content
const extractTextFromHtml = (htmlContent: string): string => {
  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content and clean it up
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up excessive whitespace
    return textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    // Fallback: strip basic HTML tags with regex
    return htmlContent
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
};