
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface EnrichmentRequestBody {
  noteId: string;
  noteContent: string;
  enhancementType: string;
  noteTitle?: string;
  noteCategory?: string;
}

export interface EnrichmentResponse {
  enhancedContent: string;
  enhancementType: string;
  tokenUsage: TokenUsage;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
