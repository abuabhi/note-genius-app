
export interface EnrichmentRequestBody {
  noteId: string;
  noteContent: string;
  enhancementType: EnhancementFunction;
  noteTitle: string;
  noteCategory?: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'generate-questions' 
  | 'improve-clarity' 
  | 'convert-to-markdown'
  | 'fix-spelling-grammar';

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
