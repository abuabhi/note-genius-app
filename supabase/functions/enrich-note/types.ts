
export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'improve-clarity' 
  | 'convert-to-markdown';

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
