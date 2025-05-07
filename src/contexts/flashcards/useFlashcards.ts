import { supabase } from '@/integrations/supabase/client';
import { 
  Flashcard, 
  FlashcardSet, 
  CreateFlashcardPayload, 
  CreateFlashcardSetPayload 
} from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { FlashcardState } from './types';

export const useFlashcards = (
  state: FlashcardState
) => {
  const { 
    setFlashcards, 
    setFlashcardSets, 
    setLoading,
    currentFlashcard, 
    setCurrentFlashcard,
    currentSet, 
    setCurrentSet,
  } = state;
  
  const { toast } = useToast();

  // Fetch all flashcard sets
  const fetchFlashcardSets = async () => {
    try {
      setLoading(prev => ({ ...prev, sets: true }));
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(*)')
        .eq('is_built_in', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add computed card count field (will fill in later)
      const setsWithCardCount = await Promise.all(data.map(async (set) => {
        // Get count of cards in this set
        const { count, error: countError } = await supabase
          .from('flashcard_set_cards')
          .select('*', { count: 'exact', head: true })
          .eq('set_id', set.id);
        
        if (countError) console.error('Error fetching card count:', countError);
        
        return {
          ...set,
          card_count: count || 0,
        };
      }));
      
      setFlashcardSets(setsWithCardCount);
      return setsWithCardCount;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast({
        title: 'Error fetching flashcard sets',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Fetch built-in flashcard sets for the library
  const fetchBuiltInSets = async () => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(*)')
        .eq('is_built_in', true)
        .order('name');
      
      if (error) throw error;
      
      // Add computed card count field
      const setsWithCardCount = await Promise.all(data.map(async (set) => {
        // Get count of cards in this set
        const { count, error: countError } = await supabase
          .from('flashcard_set_cards')
          .select('*', { count: 'exact', head: true })
          .eq('set_id', set.id);
        
        if (countError) console.error('Error fetching card count:', countError);
        
        return {
          ...set,
          card_count: count || 0,
        };
      }));
      
      return setsWithCardCount;
    } catch (error) {
      console.error('Error fetching built-in sets:', error);
      throw error;
    }
  };

  // Clone a built-in flashcard set for the user
  const cloneFlashcardSet = async (setId: string) => {
    try {
      // First, get the set details
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();
      
      if (setError) throw setError;
      
      // Create a new set for the user (clone)
      const { data: newSet, error: newSetError } = await supabase
        .from('flashcard_sets')
        .insert({
          name: setData.name,
          description: setData.description,
          subject: setData.subject,
          topic: setData.topic,
          category_id: setData.category_id,
          is_built_in: false,
        })
        .select()
        .single();
      
      if (newSetError) throw newSetError;
      
      // Get all cards from the original set
      const { data: setCards, error: cardsError } = await supabase
        .from('flashcard_set_cards')
        .select('*, flashcard:flashcards(*)')
        .eq('set_id', setId)
        .order('position');
      
      if (cardsError) throw cardsError;
      
      // Clone each flashcard
      for (const card of setCards) {
        const flashcard = card.flashcard;
        
        // Create new flashcard
        const { data: newFlashcard, error: flashcardError } = await supabase
          .from('flashcards')
          .insert({
            front_content: flashcard.front_content,
            back_content: flashcard.back_content,
            difficulty: flashcard.difficulty,
            is_built_in: false,
          })
          .select()
          .single();
        
        if (flashcardError) throw flashcardError;
        
        // Add to the new set
        const { error: addError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            set_id: newSet.id,
            flashcard_id: newFlashcard.id,
            position: card.position,
          });
        
        if (addError) throw addError;
      }
      
      // Refresh sets
      await fetchFlashcardSets();
      
      return newSet;
    } catch (error) {
      console.error('Error cloning flashcard set:', error);
      throw error;
    }
  };

  // Fetch all flashcards for the current user
  const fetchFlashcards = async () => {
    try {
      setLoading(prev => ({ ...prev, flashcards: true }));
      
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure the difficulty is of type FlashcardDifficulty
      const typedFlashcards = data.map(card => ({
        ...card,
        difficulty: card.difficulty as FlashcardDifficulty
      }));
      
      setFlashcards(typedFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: 'Error fetching flashcards',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, flashcards: false }));
    }
  };

  // Fetch flashcards in a specific set
  const fetchFlashcardsInSet = async (setId: string): Promise<Flashcard[]> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_set_cards')
        .select(`
          position,
          flashcard:flashcard_id (*)
        `)
        .eq('set_id', setId)
        .order('position');
      
      if (error) throw error;
      
      // Extract the flashcards from the joined query and maintain the position order
      const orderedFlashcards = data
        .map(item => ({ 
          ...item.flashcard,
          difficulty: item.flashcard.difficulty as FlashcardDifficulty,
          position: item.position 
        }))
        .sort((a, b) => a.position - b.position);
      
      return orderedFlashcards;
    } catch (error) {
      console.error('Error fetching flashcards in set:', error);
      toast({
        title: 'Error fetching flashcards',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Create a new flashcard
  const createFlashcard = async (cardData: CreateFlashcardPayload, setId?: string): Promise<Flashcard | null> => {
    try {
      // First, create the flashcard
      const { data, error } = await supabase
        .from('flashcards')
        .insert(cardData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Ensure the difficulty is of type FlashcardDifficulty
      const typedFlashcard = {
        ...data,
        difficulty: data.difficulty as FlashcardDifficulty
      };
      
      // Update local state
      setFlashcards(prev => [typedFlashcard, ...prev]);
      
      // If a set ID is provided, add the flashcard to that set
      if (setId) {
        // Get the current highest position in the set
        const { data: positionData, error: positionError } = await supabase
          .from('flashcard_set_cards')
          .select('position')
          .eq('set_id', setId)
          .order('position', { ascending: false })
          .limit(1);
        
        const nextPosition = positionError || !positionData.length ? 0 : positionData[0].position + 1;
        
        // Add the flashcard to the set
        const { error: linkError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            flashcard_id: data.id,
            set_id: setId,
            position: nextPosition,
          });
        
        if (linkError) throw linkError;
        
        // Update the card count for the set
        setFlashcardSets(prev => 
          prev.map(set => set.id === setId ? { ...set, card_count: (set.card_count || 0) + 1 } : set)
        );
      }
      
      toast({
        title: 'Flashcard created',
        description: 'Your new flashcard has been created successfully.',
      });
      
      return typedFlashcard;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast({
        title: 'Error creating flashcard',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update an existing flashcard
  const updateFlashcard = async (id: string, cardData: Partial<CreateFlashcardPayload>) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .update(cardData)
        .eq('id', id);
      
      if (error) throw error;
      
      setFlashcards(prev => 
        prev.map(card => card.id === id ? { ...card, ...cardData } : card)
      );
      
      toast({
        title: 'Flashcard updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast({
        title: 'Error updating flashcard',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Delete a flashcard
  const deleteFlashcard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFlashcards(prev => prev.filter(card => card.id !== id));
      
      // Update card counts for any sets that contained this card
      const { data: setData } = await supabase
        .from('flashcard_set_cards')
        .select('set_id')
        .eq('flashcard_id', id);
      
      if (setData && setData.length > 0) {
        const affectedSetIds = setData.map(item => item.set_id);
        
        setFlashcardSets(prev => 
          prev.map(set => 
            affectedSetIds.includes(set.id) 
              ? { ...set, card_count: Math.max(0, (set.card_count || 1) - 1) } 
              : set
          )
        );
      }
      
      toast({
        title: 'Flashcard deleted',
        description: 'The flashcard has been removed.',
      });
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast({
        title: 'Error deleting flashcard',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Add a flashcard to a set
  const addFlashcardToSet = async (flashcardId: string, setId: string, position?: number) => {
    try {
      // If position is not provided, add to the end
      if (position === undefined) {
        const { data: positionData, error: positionError } = await supabase
          .from('flashcard_set_cards')
          .select('position')
          .eq('set_id', setId)
          .order('position', { ascending: false })
          .limit(1);
        
        position = positionError || !positionData.length ? 0 : positionData[0].position + 1;
      }
      
      // Add the flashcard to the set
      const { error } = await supabase
        .from('flashcard_set_cards')
        .insert({
          flashcard_id: flashcardId,
          set_id: setId,
          position,
        });
      
      if (error) throw error;
      
      // Update the card count for the set
      setFlashcardSets(prev => 
        prev.map(set => set.id === setId ? { ...set, card_count: (set.card_count || 0) + 1 } : set)
      );
      
      toast({
        title: 'Flashcard added to set',
        description: 'The flashcard has been added to the set.',
      });
    } catch (error) {
      console.error('Error adding flashcard to set:', error);
      toast({
        title: 'Error adding flashcard to set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Remove a flashcard from a set
  const removeFlashcardFromSet = async (flashcardId: string, setId: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_set_cards')
        .delete()
        .match({ flashcard_id: flashcardId, set_id: setId });
      
      if (error) throw error;
      
      // Update the card count for the set
      setFlashcardSets(prev => 
        prev.map(set => set.id === setId ? { ...set, card_count: Math.max(0, (set.card_count || 1) - 1) } : set)
      );
      
      toast({
        title: 'Flashcard removed from set',
        description: 'The flashcard has been removed from the set.',
      });
    } catch (error) {
      console.error('Error removing flashcard from set:', error);
      toast({
        title: 'Error removing flashcard from set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return {
    fetchFlashcardSets,
    fetchBuiltInSets,
    cloneFlashcardSet,
    fetchFlashcards,
    fetchFlashcardsInSet,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addFlashcardToSet,
    removeFlashcardFromSet,
  };
};
