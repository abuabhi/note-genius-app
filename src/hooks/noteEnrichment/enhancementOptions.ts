
import { EnhancementFunction, EnhancementOption } from './types';

export const enhancementOptions: EnhancementOption[] = [
  {
    id: 'summarize',
    value: 'summarize',
    title: 'Summarize',
    description: 'Create a concise summary of your note',
    icon: 'FileText',
    outputType: 'summary',
    replaceContent: false
  },
  {
    id: 'extract-key-points',
    value: 'extract-key-points',
    title: 'Extract Key Points',
    description: 'Pull out the most important points from your note',
    icon: 'ListChecks',
    outputType: 'keyPoints',
    replaceContent: false
  },
  {
    id: 'create-flashcards',
    value: 'create-flashcards',
    title: 'Create Flashcards',
    description: 'Create flashcards based on your note (Coming Soon)',
    icon: 'BookOpen',
    outputType: 'flashcards',
    replaceContent: false
  },
  {
    id: 'improve-clarity',
    value: 'improve-clarity',
    title: 'Improve Clarity',
    description: 'Rewrite your note for better clarity and readability',
    icon: 'Brush',
    outputType: 'improved',
    replaceContent: true
  },
  {
    id: 'fix-spelling-grammar',
    value: 'fix-spelling-grammar',
    title: 'Fix Spelling & Grammar',
    description: 'Correct spelling and grammar errors in your note',
    icon: 'Check',
    outputType: 'fixed',
    replaceContent: true
  },
  {
    id: 'convert-to-markdown',
    value: 'convert-to-markdown',
    title: 'Convert to Markdown',
    description: 'Format your note as markdown for better structure',
    icon: 'Code',
    outputType: 'markdown',
    replaceContent: true
  }
];
