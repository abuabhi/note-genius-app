
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { useFlashcards } from '@/contexts/flashcards';
import { toast } from 'sonner';

export const useFlashcardIntegration = (note: Note) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { createFlashcard, flashcardSets, createFlashcardSet } = useFlashcards();

  const findOrCreateFlashcardSet = useCallback(async (note: Note) => {
    console.log('Finding or creating flashcard set for note:', note.title);
    console.log('Available flashcard sets:', flashcardSets.map(s => ({ id: s.id, name: s.name, subject: s.subject })));

    // 1. Try exact note title match
    let existingSet = flashcardSets.find(set => 
      set.name.toLowerCase() === note.title.toLowerCase()
    );

    if (existingSet) {
      console.log('Found exact title match:', existingSet.name);
      return existingSet;
    }

    // 2. Try note title + " Flashcards" match
    const noteFlashcardsName = `${note.title} Flashcards`;
    existingSet = flashcardSets.find(set => 
      set.name.toLowerCase() === noteFlashcardsName.toLowerCase()
    );

    if (existingSet) {
      console.log('Found title + "Flashcards" match:', existingSet.name);
      return existingSet;
    }

    // 3. Try category/subject match (only if note has a category)
    if (note.category) {
      existingSet = flashcardSets.find(set => 
        set.subject?.toLowerCase() === note.category.toLowerCase()
      );

      if (existingSet) {
        console.log('Found category/subject match:', existingSet.name);
        return existingSet;
      }
    }

    // 4. Create new set if none found
    console.log('No existing set found, creating new set');
    try {
      const newSet = await createFlashcardSet({
        name: noteFlashcardsName,
        description: `Flashcards created from "${note.title}" note`,
        subject: note.category || 'General',
        topic: note.title
      });

      console.log('Created new flashcard set:', newSet);
      toast.success(`Created new flashcard set: "${noteFlashcardsName}"`);
      return newSet;
    } catch (error) {
      console.error('Failed to create flashcard set:', error);
      throw new Error('Failed to create flashcard set');
    }
  }, [note, flashcardSets, createFlashcardSet]);

  const generateFlashcardFromChat = useCallback(async (
    question: string,
    answer: string,
    setId?: string
  ) => {
    setIsGenerating(true);
    try {
      let targetSetId = setId;
      
      if (!targetSetId) {
        const flashcardSet = await findOrCreateFlashcardSet(note);
        targetSetId = flashcardSet.id;
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
  }, [note, createFlashcard, findOrCreateFlashcardSet]);

  const generateFlashcardsFromContent = useCallback(async (
    content: string,
    count: number = 3
  ) => {
    setIsGenerating(true);
    try {
      const flashcardSet = await findOrCreateFlashcardSet(note);
      
      // This would typically call an AI service to generate multiple flashcards
      // For now, we'll create a simple implementation
      const segments = content.split('\n').filter(line => line.trim().length > 10);
      const flashcards = [];

      for (let i = 0; i < Math.min(count, segments.length); i++) {
        const segment = segments[i];
        const question = `What is the key point about: ${segment.slice(0, 50)}...?`;
        const answer = segment;

        const flashcard = await generateFlashcardFromChat(question, answer, flashcardSet.id);
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
  }, [generateFlashcardFromChat, findOrCreateFlashcardSet, note]);

  return {
    isGenerating,
    generateFlashcardFromChat,
    generateFlashcardsFromContent
  };
};
