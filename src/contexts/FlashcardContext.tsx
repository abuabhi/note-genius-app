import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard, FlashcardSet, CreateFlashcardPayload, CreateFlashcardSetPayload, FlashcardScore, FlashcardProgress, SubjectCategory, FlashcardDifficulty } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface FlashcardContextType {
  // Data
  flashcards: Flashcard[];
  flashcardSets: FlashcardSet[];
  currentFlashcard: Flashcard | null;
  currentSet: FlashcardSet | null;
  categories: SubjectCategory[];
  
  // Loading states
  loading: {
    flashcards: boolean;
    sets: boolean;
    categories: boolean;
  };

  // Set operations
  fetchFlashcardSets: () => Promise<void>;
  createFlashcardSet: (setData: CreateFlashcardSetPayload) => Promise<FlashcardSet | null>;
  updateFlashcardSet: (id: string, setData: Partial<CreateFlashcardSetPayload>) => Promise<void>;
  deleteFlashcardSet: (id: string) => Promise<void>;
  fetchFlashcardsInSet: (setId: string) => Promise<Flashcard[]>;
  
  // Flashcard operations
  fetchFlashcards: () => Promise<void>;
  createFlashcard: (cardData: CreateFlashcardPayload, setId?: string) => Promise<Flashcard | null>;
  updateFlashcard: (id: string, cardData: Partial<CreateFlashcardPayload>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  addFlashcardToSet: (flashcardId: string, setId: string, position?: number) => Promise<void>;
  removeFlashcardFromSet: (flashcardId: string, setId: string) => Promise<void>;
  
  // Study operations
  recordFlashcardReview: (flashcardId: string, score: FlashcardScore) => Promise<void>;
  getFlashcardProgress: (flashcardId: string) => Promise<FlashcardProgress | null>;
  
  // Category operations
  fetchCategories: () => Promise<void>;
  
  // Current states
  setCurrentFlashcard: (flashcard: Flashcard | null) => void;
  setCurrentSet: (set: FlashcardSet | null) => void;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [categories, setCategories] = useState<SubjectCategory[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState({
    flashcards: false,
    sets: false,
    categories: false,
  });
  
  const { toast } = useToast();
  const { profile } = useRequireAuth();

  // Fetch all flashcard sets for the current user
  const fetchFlashcardSets = async () => {
    try {
      setLoading(prev => ({ ...prev, sets: true }));
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get card counts for each set
      const setsWithCardCounts = await Promise.all(
        data.map(async (set) => {
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          
          return {
            ...set,
            card_count: countError ? 0 : count || 0,
          };
        })
      );
      
      setFlashcardSets(setsWithCardCounts);
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast({
        title: 'Error fetching flashcard sets',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Create a new flashcard set
  const createFlashcardSet = async (setData: CreateFlashcardSetPayload): Promise<FlashcardSet | null> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert(setData)
        .select()
        .single();
      
      if (error) throw error;
      
      setFlashcardSets(prev => [{ ...data, card_count: 0 }, ...prev]);
      toast({
        title: 'Flashcard set created',
        description: `"${data.name}" has been created successfully.`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      toast({
        title: 'Error creating flashcard set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update an existing flashcard set
  const updateFlashcardSet = async (id: string, setData: Partial<CreateFlashcardSetPayload>) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update(setData)
        .eq('id', id);
      
      if (error) throw error;
      
      setFlashcardSets(prev => 
        prev.map(set => set.id === id ? { ...set, ...setData } : set)
      );
      
      toast({
        title: 'Flashcard set updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      toast({
        title: 'Error updating flashcard set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Delete a flashcard set
  const deleteFlashcardSet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFlashcardSets(prev => prev.filter(set => set.id !== id));
      
      toast({
        title: 'Flashcard set deleted',
        description: 'The flashcard set has been removed.',
      });
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast({
        title: 'Error deleting flashcard set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
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

  // Record a flashcard review using the SM-2 spaced repetition algorithm
  const recordFlashcardReview = async (flashcardId: string, score: FlashcardScore) => {
    try {
      // Get the current progress for this flashcard
      const { data: progressData, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .eq('user_id', profile?.id);
      
      // Calculate the new spaced repetition values using the SM-2 algorithm
      let easeFactor = 2.5;
      let interval = 0;
      let repetition = 0;
      
      if (!progressError && progressData && progressData.length > 0) {
        const progress = progressData[0];
        easeFactor = progress.ease_factor;
        interval = progress.interval;
        repetition = progress.repetition;
      }
      
      // SM-2 algorithm implementation
      if (score < 3) {
        // If score is less than 3, reset repetition and interval
        repetition = 0;
        interval = 1;
      } else {
        // Update values based on the algorithm
        repetition += 1;
        
        if (repetition === 1) {
          interval = 1;
        } else if (repetition === 2) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
      }
      
      // Update ease factor
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)));
      
      // Calculate the next review date
      const now = new Date();
      const nextReviewAt = new Date();
      nextReviewAt.setDate(now.getDate() + interval);
      
      // Upsert the progress data
      const progressPayload = {
        flashcard_id: flashcardId,
        ease_factor: easeFactor,
        interval,
        repetition,
        last_reviewed_at: now.toISOString(),
        next_review_at: nextReviewAt.toISOString(),
        last_score: score,
      };
      
      if (!progressError && progressData && progressData.length > 0) {
        // Update existing progress
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update(progressPayload)
          .eq('id', progressData[0].id);
        
        if (error) throw error;
      } else {
        // Insert new progress
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert(progressPayload);
        
        if (error) throw error;
      }
      
      // Update the flashcard's last reviewed date
      await supabase
        .from('flashcards')
        .update({
          last_reviewed_at: now.toISOString(),
          next_review_at: nextReviewAt.toISOString(),
        })
        .eq('id', flashcardId);
      
    } catch (error) {
      console.error('Error recording flashcard review:', error);
      toast({
        title: 'Error recording review',
        description: 'Your progress may not have been saved.',
        variant: 'destructive',
      });
    }
  };

  // Get the progress data for a specific flashcard
  const getFlashcardProgress = async (flashcardId: string): Promise<FlashcardProgress | null> => {
    try {
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .eq('user_id', profile?.id)
        .single();
      
      if (error || !data) return null;
      
      return data;
    } catch (error) {
      console.error('Error getting flashcard progress:', error);
      return null;
    }
  };

  // Fetch all subject categories
  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      const { data, error } = await supabase
        .from('subject_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Organize into hierarchical structure
      const rootCategories: SubjectCategory[] = [];
      const categoriesById: Record<string, SubjectCategory> = {};
      
      // First pass: index all categories by ID
      data.forEach(category => {
        categoriesById[category.id] = { ...category, subcategories: [] };
      });
      
      // Second pass: build the tree structure
      data.forEach(category => {
        if (category.parent_id) {
          // Add to parent's subcategories
          const parent = categoriesById[category.parent_id];
          if (parent && parent.subcategories) {
            parent.subcategories.push(categoriesById[category.id]);
          }
        } else {
          // Root category
          rootCategories.push(categoriesById[category.id]);
        }
      });
      
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error fetching categories',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  return (
    <FlashcardContext.Provider value={{
      flashcards,
      flashcardSets,
      currentFlashcard,
      currentSet,
      categories,
      loading,
      fetchFlashcardSets,
      createFlashcardSet,
      updateFlashcardSet,
      deleteFlashcardSet,
      fetchFlashcardsInSet,
      fetchFlashcards,
      createFlashcard,
      updateFlashcard,
      deleteFlashcard,
      addFlashcardToSet,
      removeFlashcardFromSet,
      recordFlashcardReview,
      getFlashcardProgress,
      fetchCategories,
      setCurrentFlashcard,
      setCurrentSet
    }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};
