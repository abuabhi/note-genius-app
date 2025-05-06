
export interface Note {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content?: string;
  sourceType?: 'manual' | 'scan' | 'import';
  scanData?: {
    originalImageUrl?: string;
    recognizedText?: string;
    confidence?: number;
  };
  importData?: {
    originalFileUrl?: string;
    fileType?: string;
    importedAt?: string;
  };
}
