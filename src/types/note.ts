
export interface Note {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content?: string;
  sourceType?: 'manual' | 'scan';
  scanData?: {
    originalImageUrl?: string;
    recognizedText?: string;
    confidence?: number;
  };
}
