
export type EnhancementFunction = 
  | 'summarize' 
  | 'addKeyPoints' 
  | 'explainConcepts' 
  | 'suggestQuestions' 
  | 'addExamples'
  | 'improvePhrasing';

export interface EnhancementOption {
  id: EnhancementFunction;
  name: string;
  description: string;
  icon: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
