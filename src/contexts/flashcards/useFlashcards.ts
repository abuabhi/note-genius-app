
import { supabase } from '@/integrations/supabase/client';
import { 
  Flashcard, 
  CreateFlashcardPayload, 
  FlashcardDifficulty 
} from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { FlashcardSet } from '@/types/flashcard';

export const useFlashcardsOperations = (
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>,
  setFlashcardSets: React.Dispatch<React.SetStateAction<FlashcardSet[]>>,
  setLoading: React.Dispatch<React.SetStateAction<{
    flashcards: boolean;
    sets: boolean;
    categories: boolean;
  }>>
) => {
  const { toast } = useToast();

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
    fetchFlashcards,
    fetchFlashcardsInSet,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addFlashcardToSet,
    removeFlashcardFromSet,
  };
};
