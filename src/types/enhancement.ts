export type EnhancementType = 'original' | 'markdown' | 'summary' | 'keyPoints' | 'enriched' | 'questions';

export interface EnhancementRequest {
  enhancementType: string;
  text: string;
}

export interface EnhancementResult {
  success: boolean;
  result?: any;
  error?: string;
  processing_time?: number;
  total_time?: number;
  tokens_used?: number;
  timestamp?: string;
}