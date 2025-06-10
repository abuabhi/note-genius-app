
import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { SmartSuggestion } from '../types/noteChat';

export const useSmartSuggestions = (note: Note) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);

  useEffect(() => {
    // Generate smart suggestions based on note content
    const generateSuggestions = () => {
      const baseSuggestions: SmartSuggestion[] = [
        {
          id: '1',
          text: 'Summarize this note in 3 key points',
          type: 'summary'
        },
        {
          id: '2',
          text: 'What are the main concepts I should focus on?',
          type: 'question'
        },
        {
          id: '3',
          text: 'Create practice questions from this content',
          type: 'action'
        }
      ];

      // Add content-specific suggestions
      const content = (note.content || note.description || '').toLowerCase();
      
      if (content.includes('formula') || content.includes('equation')) {
        baseSuggestions.push({
          id: '4',
          text: 'Explain the formulas in this note',
          type: 'question'
        });
      }
      
      if (content.includes('definition') || content.includes('term')) {
        baseSuggestions.push({
          id: '5',
          text: 'What are the key definitions I should memorize?',
          type: 'question'
        });
      }
      
      if (content.length > 500) {
        baseSuggestions.push({
          id: '6',
          text: 'Break this down into smaller study chunks',
          type: 'action'
        });
      }

      setSuggestions(baseSuggestions.slice(0, 4)); // Limit to 4 suggestions
    };

    generateSuggestions();
  }, [note]);

  return { suggestions };
};
