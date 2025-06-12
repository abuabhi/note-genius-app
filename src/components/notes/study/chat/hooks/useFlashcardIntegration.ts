import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { useFlashcards } from '@/contexts/flashcards';
import { toast } from 'sonner';

export const useFlashcardIntegration = (note: Note) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSetSelection, setShowSetSelection] = useState(false);
  const [pendingFlashcard, setPendingFlashcard] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [lastCreatedFlashcardId, setLastCreatedFlashcardId] = useState<string | null>(null);

  const { createFlashcard, flashcardSets, createFlashcardSet, fetchFlashcardSets } = useFlashcards();

  const findOrCreateFlashcardSet = useCallback(async (note: Note) => {
    console.log('Finding or creating flashcard set for note:', note.title);
    
    // Force refresh the flashcard sets to get the latest data
    await fetchFlashcardSets();
    
    console.log('Available flashcard sets after refresh:', flashcardSets.map(s => ({ id: s.id, name: s.name, subject: s.subject })));

    // 1. Try exact note title match
    let existingSet = flashcardSets.find(set => 
      set.name.toLowerCase().trim() === note.title.toLowerCase().trim()
    );

    if (existingSet) {
      console.log('Found exact title match:', existingSet.name);
      return existingSet;
    }

    // 2. Try note title + " Flashcards" match
    const noteFlashcardsName = `${note.title} Flashcards`;
    existingSet = flashcardSets.find(set => 
      set.name.toLowerCase().trim() === noteFlashcardsName.toLowerCase().trim()
    );

    if (existingSet) {
      console.log('Found title + "Flashcards" match:', existingSet.name);
      return existingSet;
    }

    // 3. Try subject match (only if note has a subject and fewer than 3 sets exist for this subject)
    if (note.subject_id) {
      const subjectSets = flashcardSets.filter(set => 
        set.subject_id === note.subject_id
      );
      
      // Only use existing subject set if there are very few sets to avoid confusion
      if (subjectSets.length === 1) {
        console.log('Found single subject match:', subjectSets[0].name);
        return subjectSets[0];
      }
    }

    // 4. Create new set if none found
    console.log('No existing set found, creating new set');
    try {
      const newSet = await createFlashcardSet({
        name: noteFlashcardsName,
        description: `Flashcards created from "${note.title}" note`,
        subject: note.subject || 'General',
        topic: note.title,
        subject_id: note.subject_id // Use the note's subject_id
      });

      console.log('Created new flashcard set:', newSet);
      toast.success(`Created new flashcard set: "${noteFlashcardsName}"`);
      
      // Force refresh after creating to ensure state is up to date
      await fetchFlashcardSets();
      
      return newSet;
    } catch (error) {
      console.error('Failed to create flashcard set:', error);
      throw new Error('Failed to create flashcard set');
    }
  }, [note, flashcardSets, createFlashcardSet, fetchFlashcardSets]);

  const getSuggestedSetId = useCallback(() => {
    // Try to find the best matching set
    const exactMatch = flashcardSets.find(set => 
      set.name.toLowerCase().trim() === note.title.toLowerCase().trim()
    );
    if (exactMatch) return exactMatch.id;

    const titleMatch = flashcardSets.find(set => 
      set.name.toLowerCase().trim() === `${note.title} Flashcards`.toLowerCase().trim()
    );
    if (titleMatch) return titleMatch.id;

    if (note.subject_id) {
      const subjectMatches = flashcardSets.filter(set => 
        set.subject_id === note.subject_id
      );
      // Only suggest if there's exactly one match to avoid confusion
      if (subjectMatches.length === 1) return subjectMatches[0].id;
    }

    return undefined;
  }, [note, flashcardSets]);

  const generateFlashcardFromChat = useCallback(async (
    question: string,
    answer: string,
    setId?: string,
    showModal: boolean = false
  ) => {
    setIsGenerating(true);
    
    try {
      // If manual selection is requested, show the modal
      if (showModal) {
        setPendingFlashcard({ question, answer });
        setShowSetSelection(true);
        setIsGenerating(false);
        return null;
      }

      let targetSetId = setId;
      
      if (!targetSetId) {
        const flashcardSet = await findOrCreateFlashcardSet(note);
        targetSetId = flashcardSet.id;
      }

      const flashcard = await createFlashcard({
        front_content: question,
        back_content: answer,
        set_id: targetSetId,
        subject: note.subject
      });

      setLastCreatedFlashcardId(flashcard.id);
      toast.success('Flashcard created successfully!');
      return flashcard;
    } catch (error) {
      console.error('Error creating flashcard from chat:', error);
      toast.error('Failed to create flashcard');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [note, createFlashcard, findOrCreateFlashcardSet]);

  const handleSetSelection = useCallback(async (selectedSetId: string) => {
    if (!pendingFlashcard) return;
    
    setShowSetSelection(false);
    await generateFlashcardFromChat(
      pendingFlashcard.question,
      pendingFlashcard.answer,
      selectedSetId
    );
    setPendingFlashcard(null);
  }, [pendingFlashcard, generateFlashcardFromChat]);

  const handleModalClose = useCallback(() => {
    setShowSetSelection(false);
    setPendingFlashcard(null);
    setIsGenerating(false);
  }, []);

  const showChooseDifferentSet = useCallback(() => {
    if (!lastCreatedFlashcardId) return;
    
    // For the "choose different set" feature, we would need the last Q&A
    // This is a placeholder for future implementation
    toast.info('Choose different set feature coming soon!');
  }, [lastCreatedFlashcardId]);

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
    showSetSelection,
    suggestedSetId: getSuggestedSetId(),
    lastCreatedFlashcardId,
    generateFlashcardFromChat,
    generateFlashcardsFromContent,
    handleSetSelection,
    handleModalClose,
    showChooseDifferentSet,
    pendingFlashcard
  };
};
