
export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'generate-questions' 
  | 'convert-to-markdown'
  | 'improve-clarity'
  | 'enrich-note';

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export interface EnrichmentRequestBody {
  noteId: string;
  noteContent: string;
  enhancementType: EnhancementFunction;
  noteTitle: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
