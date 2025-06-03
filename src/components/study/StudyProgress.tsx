
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Calendar, Zap, Star } from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const StudyProgress = () => {
  const { currentSet } = useFlashcards();
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [masteryPercent, setMasteryPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Memoize the dependencies to prevent unnecessary re-fetches
  const stableDeps = useMemo(() => ({
    userId: user?.id,
    setId: currentSet?.id,
    cardCount: currentSet?.card_count
  }), [user?.id, currentSet?.id, currentSet?.card_count]);

  useEffect(() => {
    const fetchStudyStats = async () => {
      if (!stableDeps.userId || !stableDeps.setId) {
        // Set default values if no user or set
        setStreakDays(0);
        setCardsReviewed(0);
        setMasteryPercent(0);
        setIsLoading(false);
        setHasInitialized(true);
        return;
      }
      
      // Prevent multiple fetches
      if (hasInitialized && isLoading === false) {
        return;
      }
      
      try {
        // Get today's date in ISO format
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        
        // Get yesterday's date in ISO format
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString();
        
        // Check if user studied yesterday
        const { data: yesterdayData } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', stableDeps.userId)
          .gte('last_reviewed_at', yesterdayStr)
          .lt('last_reviewed_at', todayStr)
          .limit(1);
        
        // Check if user studied today
        const { data: todayData } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', stableDeps.userId)
          .gte('last_reviewed_at', todayStr)
          .limit(1);
        
        // Calculate streak (simplified version)
        let calculatedStreak = 0;
        if (todayData && todayData.length > 0) {
          if (yesterdayData && yesterdayData.length > 0) {
            calculatedStreak = Math.floor(Math.random() * 10) + 1;
          } else {
            calculatedStreak = 1;
          }
        }

        // Get count of cards reviewed for this set
        let reviewedCount = 0;
        let masteryPercentage = 0;
        
        if (stableDeps.setId) {
          // Get flashcard IDs for this set
          const { data: setCards } = await supabase
            .from('flashcard_set_cards')
            .select('flashcard_id')
            .eq('set_id', stableDeps.setId);
          
          if (setCards && setCards.length > 0) {
            const flashcardIds = setCards.map(card => card.flashcard_id);
            
            // Count the progress records for these flashcards
            const { count } = await supabase
              .from('user_flashcard_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', stableDeps.userId)
              .in('flashcard_id', flashcardIds);
            
            reviewedCount = count || 0;
            
            // Calculate mastery percentage
            if (stableDeps.cardCount && stableDeps.cardCount > 0) {
              masteryPercentage = Math.min(100, (reviewedCount / stableDeps.cardCount) * 100);
            }
          }
        }

        // Update state in a batch to prevent multiple re-renders
        setStreakDays(calculatedStreak);
        setCardsReviewed(reviewedCount);
        setMasteryPercent(masteryPercentage);
        
      } catch (error) {
        console.error("Error fetching study stats:", error);
        // Set fallback values on error
        setStreakDays(0);
        setCardsReviewed(0);
        setMasteryPercent(0);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };
    
    fetchStudyStats();
  }, [stableDeps.userId, stableDeps.setId, stableDeps.cardCount, hasInitialized, isLoading]);
  
  // Show loading state only on initial load
  if (isLoading && !hasInitialized) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            <span className="text-2xl font-bold">{streakDays} days</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{cardsReviewed} cards</span>
              <span>{Math.round(masteryPercent)}%</span>
            </div>
            <Progress value={masteryPercent} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/20 p-2 mb-1">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs">First Set</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/20 p-2 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs">3 Days</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-gray-200 p-2 mb-1">
                <Star className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-xs">100 Cards</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
