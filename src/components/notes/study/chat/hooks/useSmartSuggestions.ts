
import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { SmartSuggestion } from '../types/suggestions';

export const useSmartSuggestions = (note: Note) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);

  useEffect(() => {
    // Generate smart suggestions based on note content
    const generateSuggestions = () => {
      const baseSuggestions: SmartSuggestion[] = [
        { id: '1', text: 'Explain this concept in simple terms' },
        { id: '2', text: 'What are the key points?' },
        { id: '3', text: 'Create a summary of this content' },
        { id: '4', text: 'What questions should I ask myself?' }
      ];

      // Add content-specific suggestions based on note content
      if (note.content?.toLowerCase().includes('formula') || note.content?.toLowerCase().includes('equation')) {
        baseSuggestions.push({ id: '5', text: 'Explain these formulas step by step' });
      }

      if (note.content?.toLowerCase().includes('date') || note.content?.toLowerCase().includes('event')) {
        baseSuggestions.push({ id: '6', text: 'Create a timeline of events' });
      }

      setSuggestions(baseSuggestions);
    };

    generateSuggestions();
  }, [note]);

  return { suggestions };
};
