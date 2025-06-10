
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
  subject_id?: string;
  
  // Enhancement fields
  summary?: string;
  summary_status?: 'pending' | 'generating' | 'completed' | 'failed';
  summary_generated_at?: string;
  
  // New enhancement fields
  key_points?: string;
  key_points_generated_at?: string;
  markdown_content?: string;
  markdown_content_generated_at?: string;
  improved_content?: string;
  improved_content_generated_at?: string;
  enriched_content?: string;
  enriched_content_generated_at?: string;
  enriched_status?: 'pending' | 'generating' | 'completed' | 'failed';
  
  // Enhanced spelling/grammar fix tracking
  original_content_backup?: string;
  spelling_grammar_fixes?: {
    original: string;
    fixed: string;
    timestamp: string;
  }[];
  enhancement_type?: 'spelling-grammar' | 'clarity' | 'other';
  
  // Legacy enhancements field (for backward compatibility)
  enhancements?: {
    keyPoints?: string;
    markdown?: string;
    improved?: string;
    flashcards?: any[];
    last_enhanced_at?: string;
  };
}
