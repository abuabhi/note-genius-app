import React, { createContext, useContext, useState } from 'react';
import { FlashcardContextType, FlashcardProviderProps, FlashcardState } from './types';
import { FlashcardSet, Flashcard, SubjectCategory, FlashcardProgress, FlashcardScore, CreateFlashcardPayload, CreateFlashcardSetPayload } from '@/types/flashcard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [categories, setCategories] = useState<SubjectCategory[]>([]);
  const [loading, setLoading] = useState({
    flashcards: false,
    sets: false,
    categories: false
  });
  const { user } = useAuth();

  // Fetch all flashcard sets for the current user
  const fetchFlashcardSets = async (): Promise<FlashcardSet[]> => {
    if (!user) return [];
    
    setLoading(prev => ({ ...prev, sets: true }));
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, flashcard_set_cards(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the sets to include card count
      const formattedSets = data.map(set => ({
        ...set,
        card_count: set.flashcard_set_cards?.[0]?.count || 0
      })) as FlashcardSet[];
      
      setFlashcardSets(formattedSets);
      return formattedSets;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast.error('Failed to load flashcard sets');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Fetch built-in flashcard sets for the library
  const fetchBuiltInSets = async (): Promise<FlashcardSet[]> => {
    setLoading(prev => ({ ...prev, sets: true }));
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, flashcard_set_cards(count)')
        .eq('is_built_in', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the sets to include card count
      const formattedSets = data.map(set => ({
        ...set,
        card_count: set.flashcard_set_cards?.[0]?.count || 0
      })) as FlashcardSet[];
      
      return formattedSets;
    } catch (error) {
      console.error('Error fetching built-in flashcard sets:', error);
      toast.error('Failed to load flashcard sets');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Clone a flashcard set for the user
  const cloneFlashcardSet = async (setId: string): Promise<FlashcardSet | null> => {
    if (!user) return null;

    try {
      // Get the original set
      const { data: originalSet, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;

      // Create a new set based on the original
      const { data: newSet, error: createError } = await supabase
        .from('flashcard_sets')
        .insert({
          name: `${originalSet.name} (Copy)`,
          description: originalSet.description,
          subject: originalSet.subject,
          topic: originalSet.topic,
          category_id: originalSet.category_id,
          user_id: user.id,
          is_built_in: false
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get all cards from the original set
      const { data: originalCards, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId);

      if (cardsError) throw cardsError;

      // Clone all cards to the new set
      if (originalCards && originalCards.length > 0) {
        const newCards = originalCards.map(card => ({
          front_content: card.front_content,
          back_content: card.back_content,
          user_id: user.id,
          set_id: newSet.id,
          difficulty: card.difficulty,
          is_built_in: false
        }));

        await supabase.from('flashcards').insert(newCards);
      }

      toast.success('Flashcard set cloned successfully');
      await fetchFlashcardSets(); // Refresh the user's sets
      return newSet;
    } catch (error) {
      console.error('Error cloning flashcard set:', error);
      toast.error('Failed to clone flashcard set');
      return null;
    }
  };

  // Completely rewritten function to avoid type recursion issues
  const fetchFlashcardsInSet = async (setId: string): Promise<Flashcard[]> => {
    if (!setId) return [];
    
    setLoading(prev => ({ ...prev, flashcards: true }));
    
    try {
      // First query: Get all flashcard_ids linked to this set
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
      
      // Second query: Get the actual flashcards
      const { data: cardData, error: cardError } = await supabase
        .from('flashcards')
        .select('*')
        .in('id', flashcardIds);
      
      if (cardError) throw cardError;
      
      // Map the data to our Flashcard type
      const flashcardResults = cardData.map(card => {
        return {
          id: card.id,
          front: card.front_content,
          back: card.back_content,
          front_content: card.front_content,
          back_content: card.back_content,
          difficulty: card.difficulty || 1,
          user_id: card.user_id,
          created_at: card.created_at,
          updated_at: card.updated_at,
          is_built_in: Boolean(card.is_built_in),
          last_reviewed_at: card.last_reviewed_at,
          next_review_at: card.next_review_at,
          position: positions[card.id] || 0,
          set_id: setId
        };
      });
      
      // Sort by position
      return flashcardResults.sort((a, b) => a.position - b.position);
    } catch (error) {
      console.error('Error fetching flashcards in set:', error);
      toast.error('Failed to load flashcards');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, flashcards: false }));
    }
  };

  // All other functions...
  const fetchFlashcards = async (filters?: any): Promise<Flashcard[]> => {
    if (!user) return [];
    
    setLoading(prev => ({ ...prev, flashcards: true }));
    try {
      let query = supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id);
        
      // Apply filters if provided
      if (filters) {
        if (filters.setId) {
          query = query.eq('set_id', filters.setId);
        }
        if (filters.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }
      }
        
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setFlashcards(data as Flashcard[]);
      return data as Flashcard[];
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('Failed to load flashcards');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, flashcards: false }));
    }
  };

  const createFlashcardSet = async (setData: CreateFlashcardSetPayload): Promise<FlashcardSet | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert({
          ...setData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchFlashcardSets();
      toast.success('Flashcard set created successfully');
      return data as FlashcardSet;
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      toast.error('Failed to create flashcard set');
      return null;
    }
  };

  const updateFlashcardSet = async (id: string, setData: Partial<CreateFlashcardSetPayload>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update(setData)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await fetchFlashcardSets();
      toast.success('Flashcard set updated successfully');
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      toast.error('Failed to update flashcard set');
    }
  };

  const deleteFlashcardSet = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setFlashcardSets(prev => prev.filter(set => set.id !== id));
      toast.success('Flashcard set deleted successfully');
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast.error('Failed to delete flashcard set');
    }
  };

  const createFlashcard = async (cardData: CreateFlashcardPayload, setId?: string): Promise<Flashcard | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          ...cardData,
          set_id: setId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchFlashcards();
      toast.success('Flashcard created successfully');
      return data as Flashcard;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast.error('Failed to create flashcard');
      return null;
    }
  };

  const updateFlashcard = async (id: string, cardData: Partial<CreateFlashcardPayload>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .update(cardData)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await fetchFlashcards();
      toast.success('Flashcard updated successfully');
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast.error('Failed to update flashcard');
    }
  };

  const deleteFlashcard = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setFlashcards(prev => prev.filter(card => card.id !== id));
      toast.success('Flashcard deleted successfully');
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    }
  };

  const addFlashcardToSet = async (flashcardId: string, setId: string, position?: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('flashcard_set_cards')
        .insert({
          flashcard_id: flashcardId,
          set_id: setId,
          position: position || 0
        });

      if (error) throw error;
      
      toast.success('Flashcard added to set');
    } catch (error) {
      console.error('Error adding flashcard to set:', error);
      toast.error('Failed to add flashcard to set');
    }
  };

  const removeFlashcardFromSet = async (flashcardId: string, setId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('flashcard_set_cards')
        .delete()
        .eq('flashcard_id', flashcardId)
        .eq('set_id', setId);

      if (error) throw error;
      
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
        .single();

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
        .single();

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

  const fetchCategories = async (): Promise<SubjectCategory[]> => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const { data, error } = await supabase
        .from('subject_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setCategories(data as SubjectCategory[]);
      return data as SubjectCategory[];
    } catch (error) {
      console.error('Error fetching subject categories:', error);
      toast.error('Failed to load subject categories');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  return (
    <FlashcardContext.Provider
      value={{
        flashcards,
        flashcardSets,
        currentFlashcard,
        currentSet,
        categories,
        setCategories,
        loading,
        fetchFlashcardSets,
        fetchFlashcardsInSet,
        createFlashcardSet,
        updateFlashcardSet,
        deleteFlashcardSet,
        fetchFlashcards,
        createFlashcard,
        updateFlashcard,
        deleteFlashcard,
        addFlashcardToSet,
        removeFlashcardFromSet,
        recordFlashcardReview,
        getFlashcardProgress,
        fetchCategories,
        fetchBuiltInSets,
        cloneFlashcardSet,
        setCurrentFlashcard,
        setCurrentSet
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};
