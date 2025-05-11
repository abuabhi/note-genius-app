
import { EnhancementFunction, EnhancementOption } from './types';

export const enhancementOptions: EnhancementOption[] = [
  {
    id: 'summarize',
    value: 'summarize',
    title: 'Summarize',
    description: 'Create a concise summary of your note',
    icon: 'FileText'
  },
  {
    id: 'extract-key-points',
    value: 'extract-key-points',
    title: 'Extract Key Points',
    description: 'Pull out the most important points from your note',
    icon: 'ListChecks'
  },
  {
    id: 'generate-questions',
    value: 'generate-questions',
    title: 'Generate Questions',
    description: 'Create study questions based on your note content',
    icon: 'HelpCircle'
  },
  {
    id: 'improve-clarity',
    value: 'improve-clarity',
    title: 'Improve Clarity',
    description: 'Rewrite your note for better clarity and readability',
    icon: 'Brush'
  },
  {
    id: 'fix-spelling-grammar',
    value: 'fix-spelling-grammar',
    title: 'Fix Spelling & Grammar',
    description: 'Correct spelling and grammar errors in your note',
    icon: 'Check'
  },
  {
    id: 'convert-to-markdown',
    value: 'convert-to-markdown',
    title: 'Convert to Markdown',
    description: 'Format your note as markdown for better structure',
    icon: 'Code'
  }
];
