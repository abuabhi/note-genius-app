
import { supabase } from '@/integrations/supabase/client';
import { 
  Flashcard, 
  FlashcardScore,
  FlashcardProgress,
  CreateFlashcardPayload
} from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from './types';

export const useFlashcardOperations = (
  state: FlashcardState
) => {
  const { 
    setFlashcards, 
    setFlashcardSets,
    user
  } = state;

  // Helper function to convert database object to Flashcard type
  const convertToFlashcard = (data: any): Flashcard => {
    return {
      id: data.id,
      front: data.front_content || '',
      back: data.back_content || '',
      front_content: data.front_content,
      back_content: data.back_content,
      difficulty: data.difficulty,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      is_built_in: data.is_built_in,
      last_reviewed_at: data.last_reviewed_at,
      next_review_at: data.next_review_at,
      position: data.position,
      hint: data.hint,
      image_url: data.image_url,
      audio_url: data.audio_url,
      set_id: data.set_id
    };
  };

  // Fetch all flashcards for the current user
  const fetchFlashcards = async () => {
    if (!user) return [];
    
    try {
      state.setLoading(prev => ({ ...prev, flashcards: true }));
      
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const typedFlashcards: Flashcard[] = data.map(card => convertToFlashcard(card));
      setFlashcards(typedFlashcards);
      return typedFlashcards;
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('Failed to load flashcards');
      return [];
    } finally {
      state.setLoading(prev => ({ ...prev, flashcards: false }));
    }
  };

  // This is the problematic function - completely rewritten to avoid type recursion issues
  const fetchFlashcardsInSet = async (setId: string): Promise<Flashcard[]> => {
    if (!setId) return [];
    
    state.setLoading(prev => ({ ...prev, flashcards: true }));
    
    try {
      // First step: Get the relationship between flashcards and sets, with position info
      const { data: linkData, error: linkError } = await supabase
        .from('flashcard_set_cards')
        .select('flashcard_id, position')
        .eq('set_id', setId)
        .order('position');
      
      if (linkError) throw linkError;
      
      if (!linkData || linkData.length === 0) {
        return [];
      }
      
      // Extract all flashcard IDs
      const flashcardIds = linkData.map(link => link.flashcard_id);
      
      // Create a position lookup map
      const positions: Record<string, number> = {};
      linkData.forEach(link => {
        positions[link.flashcard_id] = link.position;
      });
      
      // Second step: Get the actual flashcard data
      const { data: cardData, error: cardError } = await supabase
        .from('flashcards')
        .select('*')
        .in('id', flashcardIds);
      
      if (cardError) throw cardError;
      
      // Process the flashcards and assign positions
      const flashcards = cardData.map(card => {
        const flashcard = convertToFlashcard(card);
        // Add position and set_id from our linkData
        flashcard.position = positions[card.id] || 0;
        flashcard.set_id = setId;
        return flashcard;
      });
      
      // Sort by position
      const sortedFlashcards = flashcards.sort((a, b) => {
        return (a.position || 0) - (b.position || 0);
      });
      
      return sortedFlashcards;
    } catch (error) {
      console.error('Error fetching flashcards in set:', error);
      toast.error('Failed to load flashcards');
      return [];
    } finally {
      state.setLoading(prev => ({ ...prev, flashcards: false }));
    }
  };

  // Create a new flashcard
  const createFlashcard = async (cardData: CreateFlashcardPayload, setId?: string): Promise<Flashcard | null> => {
    if (!user) return null;
    
    try {
      // First, create the flashcard
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          ...cardData,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert to proper Flashcard type
      const typedFlashcard = convertToFlashcard(data);
      
      // Update local state
      setFlashcards(prev => [typedFlashcard, ...prev]);
      
      // If a set ID is provided, add the flashcard to that set
      if (setId) {
        // Get the current highest position in the set
        const { count, error: positionError } = await supabase
          .from('flashcard_set_cards')
          .select('*', { count: 'exact', head: true })
          .eq('set_id', setId);
        
        const position = positionError || !count ? 0 : count;
        
        // Add the flashcard to the set
        const { error: linkError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            flashcard_id: data.id,
            set_id: setId,
            position,
          });
        
        if (linkError) throw linkError;
        
        // Update the card count for the set
        setFlashcardSets(prev => 
          prev.map(set => set.id === setId ? { ...set, card_count: (set.card_count || 0) + 1 } : set)
        );
      }
      
      toast.success('Flashcard created successfully');
      return typedFlashcard;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast.error('Failed to create flashcard');
      return null;
    }
  };

  // Update an existing flashcard
  const updateFlashcard = async (id: string, cardData: Partial<CreateFlashcardPayload>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('flashcards')
        .update(cardData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setFlashcards(prev => 
        prev.map(card => card.id === id ? { ...card, ...cardData } : card)
      );
      
      toast.success('Flashcard updated successfully');
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast.error('Failed to update flashcard');
    }
  };

  // Delete a flashcard
  const deleteFlashcard = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setFlashcards(prev => prev.filter(card => card.id !== id));
      
      toast.success('Flashcard deleted successfully');
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    }
  };

  // Add a flashcard to a set
  const addFlashcardToSet = async (flashcardId: string, setId: string, position?: number) => {
    if (!user) return;
    
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
      
      toast.success('Flashcard added to set');
    } catch (error) {
      console.error('Error adding flashcard to set:', error);
      toast.error('Failed to add flashcard to set');
    }
  };

  // Remove a flashcard from a set
  const removeFlashcardFromSet = async (flashcardId: string, setId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('flashcard_set_cards')
        .delete()
        .eq('flashcard_id', flashcardId)
        .eq('set_id', setId);
      
      if (error) throw error;
      
      // Update the card count for the set
      setFlashcardSets(prev => 
        prev.map(set => set.id === setId ? { ...set, card_count: Math.max(0, (set.card_count || 1) - 1) } : set)
      );
      
      toast.success('Flashcard removed from set');
    } catch (error) {
      console.error('Error removing flashcard from set:', error);
      toast.error('Failed to remove flashcard from set');
    }
  };

  const recordFlashcardReview = async (flashcardId: string, score: FlashcardScore): Promise<void> => {
    if (!user) return;
    
    try {
      // First check if there's an existing progress record
      const { data: existingProgress, error: queryError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .maybeSingle();

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw queryError;
      }

      // Apply spaced repetition algorithm to calculate next review date
      const now = new Date();
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let repetition = 0;
      let easeFactor = 2.5;
      let interval = 1;
      
      if (existingProgress) {
        repetition = existingProgress.repetition;
        easeFactor = existingProgress.ease_factor;
        
        if (score >= 3) {
          // Correct response
          if (repetition === 0) {
            interval = 1;
          } else if (repetition === 1) {
            interval = 6;
          } else {
            interval = Math.round(existingProgress.interval * easeFactor);
          }
          repetition += 1;
        } else {
          // Incorrect response, reset repetition
          repetition = 0;
          interval = 1;
        }
        
        // Adjust ease factor based on response quality
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)));
      }
      
      // Calculate next review date
      const nextReviewDate = new Date(currentDate);
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_flashcard_progress')
          .update({
            last_score: score,
            last_reviewed_at: now.toISOString(),
            next_review_at: nextReviewDate.toISOString(),
            repetition,
            interval,
            ease_factor: easeFactor
          })
          .eq('id', existingProgress.id);

        if (updateError) throw updateError;
      } else {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            last_score: score,
            last_reviewed_at: now.toISOString(),
            next_review_at: nextReviewDate.toISOString(),
            repetition,
            interval,
            ease_factor: easeFactor
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error recording flashcard review:', error);
      throw error;
    }
  };

  const getFlashcardProgress = async (flashcardId: string): Promise<FlashcardProgress | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      return data as FlashcardProgress;
    } catch (error) {
      console.error('Error getting flashcard progress:', error);
      return null;
    }
  };

  return {
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    fetchFlashcards,
    fetchFlashcardsInSet,
    addFlashcardToSet,
    removeFlashcardFromSet,
    recordFlashcardReview,
    getFlashcardProgress
  };
};
