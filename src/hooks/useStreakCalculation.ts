
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isToday, isYesterday, differenceInDays } from 'date-fns';

export const useStreakCalculation = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const calculateStreak = async () => {
    if (!user) {
      setStreak(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get all unique study dates from flashcard progress
      const { data: progressData, error } = await supabase
        .from('user_flashcard_progress')
        .select('last_reviewed_at')
        .eq('user_id', user.id)
        .not('last_reviewed_at', 'is', null)
        .order('last_reviewed_at', { ascending: false });

      if (error) {
        console.error('Error fetching progress data:', error);
        setStreak(0);
        return;
      }

      if (!progressData || progressData.length === 0) {
        setStreak(0);
        return;
      }

      // Extract unique dates and sort them
      const uniqueDates = Array.from(
        new Set(
          progressData.map(item => 
            format(new Date(item.last_reviewed_at), 'yyyy-MM-dd')
          )
        )
      ).map(dateStr => new Date(dateStr)).sort((a, b) => b.getTime() - a.getTime());

      if (uniqueDates.length === 0) {
        setStreak(0);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const mostRecentStudyDate = uniqueDates[0];
      mostRecentStudyDate.setHours(0, 0, 0, 0);

      // Check if the most recent study was today or yesterday
      if (!isToday(mostRecentStudyDate) && !isYesterday(mostRecentStudyDate)) {
        setStreak(0);
        return;
      }

      // Count consecutive days
      let streakCount = 1;
      let currentDate = mostRecentStudyDate;

      for (let i = 1; i < uniqueDates.length; i++) {
        const nextDate = uniqueDates[i];
        nextDate.setHours(0, 0, 0, 0);
        
        const expectedDate = subDays(currentDate, 1);
        expectedDate.setHours(0, 0, 0, 0);

        if (nextDate.getTime() === expectedDate.getTime()) {
          streakCount++;
          currentDate = nextDate;
        } else {
          break;
        }
      }

      setStreak(streakCount);
    } catch (error) {
      console.error('Error calculating streak:', error);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStreak();
  }, [user]);

  return {
    streak,
    loading,
    recalculateStreak: calculateStreak
  };
};
