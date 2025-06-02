
export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'create-flashcards' 
  | 'improve-clarity' 
  | 'convert-to-markdown'
  | 'fix-spelling-grammar';

export type EnhancementType = 
  | 'summary'
  | 'keyPoints'
  | 'flashcards'
  | 'improved'
  | 'fixed'
  | 'markdown';

export interface EnhancementResult {
  success: boolean;
  content: string;
  error: string;
  enhancementType?: EnhancementType;
}

export interface EnhancementOption {
  id: string;
  value?: EnhancementFunction;
  title: string;
  description: string;
  icon: string;
  prompt?: string; // Add the missing prompt property
  outputType?: EnhancementType; // Type of enhancement output
  replaceContent?: boolean; // Whether to replace original content
}

export interface EnhancementUsage {
  current: number;
  limit: number | null;
}
