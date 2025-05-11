
export interface Note {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content?: string;
  sourceType: 'manual' | 'scan' | 'import';
  archived?: boolean;
  pinned?: boolean;
  tags?: { id: string; name: string; color: string }[];
  scanData?: {
    originalImageUrl?: string;
    recognizedText?: string;
    confidence?: number;
    language?: string;
  };
  summary?: string;
  summary_status?: 'pending' | 'generating' | 'completed' | 'failed';
  subject_id?: string; // Add subject_id field
}
