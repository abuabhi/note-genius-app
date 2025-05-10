
export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'generate-questions' 
  | 'improve-clarity' 
  | 'convert-to-markdown'
  | 'fix-spelling-grammar';

export interface EnhancementOption {
  id: EnhancementFunction;
  name: string;
  description: string;
  icon: string;
}

export interface EnhancementUsage {
  current: number;
  limit: number | null;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
