
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { useFlashcards } from '@/contexts/flashcards';
import { toast } from 'sonner';

export const useFlashcardIntegration = (note: Note) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { createFlashcard, flashcardSets } = useFlashcards();

  const generateFlashcardFromChat = useCallback(async (
    question: string,
    answer: string,
    setId?: string
  ) => {
    setIsGenerating(true);
    try {
      // Find or create a default set for this note
      let targetSetId = setId;
      
      if (!targetSetId) {
        // Look for an existing set for this note or create a default one
        const noteSetName = `${note.title} - Chat Flashcards`;
        const existingSet = flashcardSets.find(set => 
          set.name === noteSetName || set.subject === note.category
        );
        
        if (existingSet) {
          targetSetId = existingSet.id;
        } else {
          // For now, we'll use a simple approach and let the user choose the set
          toast.info('Please select a flashcard set first');
          return null;
        }
      }

      const flashcard = await createFlashcard({
        front_content: question,
        back_content: answer,
        set_id: targetSetId,
        subject: note.category
      });

      toast.success('Flashcard created from chat!');
      return flashcard;
    } catch (error) {
      console.error('Error creating flashcard from chat:', error);
      toast.error('Failed to create flashcard');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [note, createFlashcard, flashcardSets]);

  const generateFlashcardsFromContent = useCallback(async (
    content: string,
    count: number = 3
  ) => {
    setIsGenerating(true);
    try {
      // This would typically call an AI service to generate multiple flashcards
      // For now, we'll create a simple implementation
      const segments = content.split('\n').filter(line => line.trim().length > 10);
      const flashcards = [];

      for (let i = 0; i < Math.min(count, segments.length); i++) {
        const segment = segments[i];
        const question = `What is the key point about: ${segment.slice(0, 50)}...?`;
        const answer = segment;

        const flashcard = await generateFlashcardFromChat(question, answer);
        if (flashcard) {
          flashcards.push(flashcard);
        }
      }

      return flashcards;
    } catch (error) {
      console.error('Error generating flashcards from content:', error);
      toast.error('Failed to generate flashcards');
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [generateFlashcardFromChat]);

  return {
    isGenerating,
    generateFlashcardFromChat,
    generateFlashcardsFromContent
  };
};
