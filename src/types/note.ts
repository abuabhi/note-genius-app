
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
  tags?: { id?: string; name: string; color: string }[];
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
  summary?: string;
  summary_status?: 'pending' | 'generating' | 'completed' | 'failed';
  summary_generated_at?: string;
  subject_id?: string;
  enhancements?: {
    keyPoints?: string;
    markdown?: string;
    improved?: string;
    flashcards?: any[]; // For future implementation
    last_enhanced_at?: string;
  };
}
