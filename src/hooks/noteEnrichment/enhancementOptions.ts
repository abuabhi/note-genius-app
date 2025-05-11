
import { EnhancementFunction } from './types';

export interface EnhancementOption {
  id: string;
  value: EnhancementFunction;
  title: string;
  description: string;
  icon: string;
}

export const enhancementOptions: EnhancementOption[] = [
  {
    id: '1',
    value: 'summarize',
    title: 'Summarize',
    description: 'Create a concise summary of your note',
    icon: 'FileText'
  },
  {
    id: '2',
    value: 'extract-key-points',
    title: 'Extract Key Points',
    description: 'Pull out the most important points from your note',
    icon: 'ListChecks'
  },
  {
    id: '3',
    value: 'generate-questions',
    title: 'Generate Questions',
    description: 'Create study questions based on your note content',
    icon: 'HelpCircle'
  },
  {
    id: '4',
    value: 'improve-clarity',
    title: 'Improve Clarity',
    description: 'Rewrite your note for better clarity and readability',
    icon: 'Brush'
  },
  {
    id: '5',
    value: 'fix-spelling-grammar',
    title: 'Fix Spelling & Grammar',
    description: 'Correct spelling and grammar errors in your note',
    icon: 'Check'
  },
  {
    id: '6',
    value: 'convert-to-markdown',
    title: 'Convert to Markdown',
    description: 'Format your note as markdown for better structure',
    icon: 'Code'
  }
];
