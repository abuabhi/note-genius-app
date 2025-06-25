
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const FAVORITES_STORAGE_KEY = 'quiz_favorites';

export const useFavoritesManager = () => {
  const [favoriteQuizIds, setFavoriteQuizIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favoriteIds = JSON.parse(stored) as string[];
        setFavoriteQuizIds(new Set(favoriteIds));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  const saveFavorites = (newFavorites: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Error saving favorites:', error);
      toast({
        title: "Error",
        description: "Failed to save favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = (quizId: string) => {
    setFavoriteQuizIds(prev => {
      const newSet = new Set(prev);
      const wasRemoved = newSet.has(quizId);
      
      if (wasRemoved) {
        newSet.delete(quizId);
        toast({
          title: "Removed from favorites",
          description: "Quiz removed from your favorites list.",
        });
      } else {
        newSet.add(quizId);
        toast({
          title: "Added to favorites",
          description: "Quiz added to your favorites list.",
        });
      }
      
      saveFavorites(newSet);
      return newSet;
    });
  };

  const isFavorite = (quizId: string) => {
    return favoriteQuizIds.has(quizId);
  };

  const getFavoriteCount = () => {
    return favoriteQuizIds.size;
  };

  const clearAllFavorites = () => {
    setFavoriteQuizIds(new Set());
    saveFavorites(new Set());
    toast({
      title: "Favorites cleared",
      description: "All favorites have been removed.",
    });
  };

  return {
    favoriteQuizIds,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    clearAllFavorites
  };
};
