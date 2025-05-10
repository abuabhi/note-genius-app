
import { EnhancementOption } from './types';

export const enhancementOptions: EnhancementOption[] = [
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Generate a concise summary of your note',
    icon: 'FileText'
  },
  {
    id: 'addKeyPoints',
    name: 'Key Points',
    description: 'Extract the most important points from your note',
    icon: 'ListChecks'
  },
  {
    id: 'explainConcepts',
    name: 'Explain Concepts',
    description: 'Identify and explain key concepts in your note',
    icon: 'Lightbulb'
  },
  {
    id: 'suggestQuestions',
    name: 'Generate Questions',
    description: 'Create study questions based on your note',
    icon: 'HelpCircle'
  },
  {
    id: 'addExamples',
    name: 'Add Examples',
    description: 'Provide examples to illustrate concepts in your note',
    icon: 'FileSymlink'
  },
  {
    id: 'improvePhrasing',
    name: 'Improve Writing',
    description: 'Enhance clarity and readability of your note',
    icon: 'Pencil'
  }
];
