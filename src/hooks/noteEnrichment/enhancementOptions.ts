
import { EnhancementOption } from './types';

export const enhancementOptions: EnhancementOption[] = [
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a concise summary of your note',
    icon: 'FileText'
  },
  {
    id: 'extract-key-points',
    name: 'Extract Key Points',
    description: 'Extract the main points from your note',
    icon: 'ListChecks'
  },
  {
    id: 'generate-questions',
    name: 'Generate Questions',
    description: 'Create study questions based on your note',
    icon: 'HelpCircle'
  },
  {
    id: 'improve-clarity',
    name: 'Improve Clarity',
    description: 'Rewrite your note for better clarity and readability',
    icon: 'Lightbulb'
  },
  {
    id: 'convert-to-markdown',
    name: 'Convert to Markdown',
    description: 'Format your note with Markdown styling',
    icon: 'FileSymlink'
  },
  {
    id: 'fix-spelling-grammar',
    name: 'Fix Spelling & Grammar',
    description: 'Correct spelling and grammar errors',
    icon: 'Pencil'
  }
];
