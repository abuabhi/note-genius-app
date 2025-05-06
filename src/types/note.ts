
export interface Note {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content?: string;
  sourceType?: 'manual' | 'scan' | 'import';
  archived?: boolean;
  pinned?: boolean;
  tags?: {
    id?: string;
    name: string;
    color: string;
  }[];
  scanData?: {
    originalImageUrl?: string;
    recognizedText?: string;
    confidence?: number;
    language?: string;
  };
  importData?: {
    originalFileUrl?: string;
    fileType?: string;
    importedAt?: string;
  };
}
