
export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'generate-questions' 
  | 'improve-clarity' 
  | 'convert-to-markdown'
  | 'fix-spelling-grammar';

export interface EnhancementResult {
  success: boolean;
  content: string;
  error: string;
}

export interface EnhancementOption {
  id: string;
  value: EnhancementFunction;
  title: string;
  description: string;
  icon: string;
}

export interface EnhancementUsage {
  current: number;
  limit: number | null;
}
