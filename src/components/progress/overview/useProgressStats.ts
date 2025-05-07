
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet } from "@/types/flashcard";

export interface ProgressStats {
  completedCourses: number;
  totalCourses: number;
  completedQuizzes: number;
  totalQuizzes: number;
  flashcardAccuracy: number;
  streakDays: number;
  totalCardsMastered: number;
  studyTimeHours: number;
  totalSets: number;
}

export const useProgressStats = () => {
  const { user } = useAuth();
  const { fetchFlashcardSets } = useFlashcards();
  const [stats, setStats] = useState<ProgressStats>({
    completedCourses: 0,
    totalCourses: 12,
    completedQuizzes: 0,
    totalQuizzes: 30,
    flashcardAccuracy: 0,
    streakDays: 0,
    totalCardsMastered: 0,
    studyTimeHours: 0,
    totalSets: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real app, we'd make API calls to get this data
        // For now, we'll use some mock data combined with real flashcard counts
        let flashcardCount = 0;
        let setCount = 0;
        
        try {
          // fetchFlashcards returns void, so we can't use its return value directly
          await fetchFlashcardSets();
          
          // We'll add a delay to allow the state update to complete
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // For now, we'll use a random number for flashcard count
          flashcardCount = Math.floor(Math.random() * 30) + 10;
        } catch (error) {
          console.error("Error fetching flashcards:", error);
        }
        
        try {
          // Get sets count - we need a better approach that won't cause TypeScript errors
          const fetchSetsData = async (): Promise<FlashcardSet[] | null> => {
            try {
              // We need to handle the scenario where fetchFlashcardSets might return void
              const result = fetchFlashcardSets();
              
              // If the result is a Promise, await it
              if (result instanceof Promise) {
                const sets = await result;
                return sets || [];
              }
              
              // If it's not a Promise and not returning anything, return empty array
              return [];
            } catch (e) {
              console.error("Error in fetchSetsData:", e);
              return null;
            }
          };
          
          // Call our wrapper function
          const sets = await fetchSetsData();
          
          // Now safely check if sets exists and is an array
          if (sets !== null) {
            setCount = sets.length;
          }
        } catch (error) {
          console.error("Error fetching sets:", error);
        }
        
        setStats({
          completedCourses: Math.floor(Math.random() * 8) + 1,
          totalCourses: 12,
          completedQuizzes: Math.floor(Math.random() * 20) + 5,
          totalQuizzes: 30,
          flashcardAccuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
          streakDays: Math.floor(Math.random() * 14) + 1,
          totalCardsMastered: Math.floor(flashcardCount * 0.7),
          studyTimeHours: Math.floor(Math.random() * 20) + 5,
          totalSets: setCount
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [user, fetchFlashcardSets]);

  return { stats, isLoading };
};
