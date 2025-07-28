
export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'create-flashcards' 
  | 'generate-questions' 
  | 'convert-to-markdown'
  | 'enrich-note';

export type EnhancementType = 
  | 'summary'
  | 'keyPoints'
  | 'flashcards'
  | 'questions'
  | 'markdown'
  | 'enriched';

export interface EnhancementResult {
  success: boolean;
  content: string;
  error: string;
  enhancementType?: EnhancementType;
}

export interface EnhancementOption {
  id: string;
  value: EnhancementFunction;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  outputType?: EnhancementType;
  replaceContent?: boolean;
}

export interface EnhancementUsage {
  current: number;
  limit: number | null;
}
