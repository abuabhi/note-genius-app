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
  // This function is now deprecated as the import logic has been moved
  // to OneNoteImportManager for consistency with Google Docs
  // and to support subject confirmation dialog
  console.log(`🚀 [ONENOTE] Legacy import function called for ${documents.length} documents`);
  throw new Error('Legacy import function - use OneNoteImportManager instead');
};

// Helper function moved to OneNoteImportManager to avoid duplication