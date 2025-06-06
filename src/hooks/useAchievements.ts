
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  achieved_at: string | null;
  points: number;
  badge_image: string;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserAchievements = async () => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('study_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        setAchievements([]);
      } else {
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('check_and_award_achievements', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking achievements:', error);
        return;
      }

      // If new achievements were awarded, show notifications and refresh
      if (data && data.length > 0) {
        data.forEach((achievement: { new_achievement_title: string }) => {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `You've earned: ${achievement.new_achievement_title}`,
            duration: 5000,
          });
        });
        
        // Refresh achievements list
        await fetchUserAchievements();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const checkReferralAchievements = async () => {
    if (!user) return;

    try {
      // Get user's referral count
      const { data: referrals } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('status', 'completed');

      const referralCount = referrals?.length || 0;

      // Check for referral achievements
      const achievementsToCheck = [
        { count: 1, title: 'First Referral' },
        { count: 5, title: 'Referral Master' },
        { count: 10, title: 'Campus Ambassador' },
        { count: 25, title: 'Viral Champion' }
      ];

      for (const achievement of achievementsToCheck) {
        if (referralCount >= achievement.count) {
          // Check if user already has this achievement
          const { data: existing } = await supabase
            .from('study_achievements')
            .select('id')
            .eq('user_id', user.id)
            .eq('title', achievement.title)
            .single();

          if (!existing) {
            // Award the achievement
            const { data: template } = await supabase
              .from('study_achievements')
              .select('*')
              .eq('title', achievement.title)
              .is('user_id', null)
              .single();

            if (template) {
              await supabase
                .from('study_achievements')
                .insert({
                  user_id: user.id,
                  title: template.title,
                  description: template.description,
                  type: template.type,
                  achieved_at: new Date().toISOString(),
                  points: template.points,
                  badge_image: template.badge_image
                });

              toast({
                title: "🎉 Achievement Unlocked!",
                description: `You've earned: ${achievement.title}`,
                duration: 5000,
              });
            }
          }
        }
      }

      // Refresh achievements list
      await fetchUserAchievements();
    } catch (error) {
      console.error('Error checking referral achievements:', error);
    }
  };

  useEffect(() => {
    fetchUserAchievements();
  }, [user]);

  return {
    achievements,
    loading,
    fetchUserAchievements,
    checkAndAwardAchievements,
    checkReferralAchievements
  };
};
