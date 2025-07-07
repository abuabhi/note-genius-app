import { useState, useEffect, useCallback } from 'react';
import { useUserTier, UserTier } from './useUserTier';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface UsageMetrics {
  notesCount: number;
  flashcardSetsCount: number;
  aiGenerationsUsed: number;
  studySessionsCount: number;
  lastActiveDate: Date;
  daysActive: number;
}

interface UpgradeIncentive {
  type: 'high-usage' | 'engagement' | 'limit-approaching' | 'feature-blocked' | 'time-based';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  trigger: string;
  showModal?: boolean;
  showNotification?: boolean;
  delaySeconds?: number;
}

export const useUpgradeIncentives = () => {
  const { user } = useAuth();
  const { userTier, tierLimits } = useUserTier();
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [activeIncentive, setActiveIncentive] = useState<UpgradeIncentive | null>(null);
  const [dismissedIncentives, setDismissedIncentives] = useState<string[]>([]);

  // Fetch user metrics
  const fetchMetrics = useCallback(async () => {
    if (!user || !tierLimits) return;

    try {
      // Fetch usage metrics
      const [notesResult, flashcardsResult, sessionsResult] = await Promise.all([
        supabase.from('notes').select('id').eq('user_id', user.id),
        supabase.from('flashcard_sets').select('id').eq('user_id', user.id),
        supabase.from('study_sessions').select('id, created_at').eq('user_id', user.id)
      ]);

      const notesCount = notesResult.data?.length || 0;
      const flashcardSetsCount = flashcardsResult.data?.length || 0;
      const studySessionsCount = sessionsResult.data?.length || 0;

      // Calculate engagement metrics
      const sessions = sessionsResult.data || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const recentSessions = sessions.filter(s => 
        new Date(s.created_at) > thirtyDaysAgo
      );

      const uniqueDays = new Set(
        recentSessions.map(s => 
          new Date(s.created_at).toDateString()
        )
      ).size;

      setMetrics({
        notesCount,
        flashcardSetsCount,
        aiGenerationsUsed: 0, // TODO: Implement AI usage tracking
        studySessionsCount,
        lastActiveDate: new Date(),
        daysActive: uniqueDays
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, [user, tierLimits]);

  // Calculate upgrade incentives
  const calculateIncentives = useCallback((): UpgradeIncentive[] => {
    if (!metrics || !tierLimits || userTier === UserTier.DEAN) return [];

    const incentives: UpgradeIncentive[] = [];

    // High usage incentive
    const notesUsagePercent = (metrics.notesCount / tierLimits.max_notes) * 100;
    const flashcardsUsagePercent = (metrics.flashcardSetsCount / tierLimits.max_flashcard_sets) * 100;

    if (notesUsagePercent >= 80 || flashcardsUsagePercent >= 80) {
      incentives.push({
        type: 'high-usage',
        priority: notesUsagePercent >= 95 ? 'critical' : 'high',
        message: 'You\'re clearly getting value from StudyFlow! 🔥',
        trigger: 'usage-80-percent',
        showNotification: true,
        showModal: notesUsagePercent >= 95
      });
    }

    // Engagement-based incentive
    if (metrics.daysActive >= 7 && metrics.studySessionsCount >= 10) {
      incentives.push({
        type: 'engagement',
        priority: 'medium',
        message: 'You\'re a dedicated learner! Students like you love our premium features.',
        trigger: 'high-engagement',
        showNotification: true,
        delaySeconds: 30
      });
    }

    // Limit approaching incentive
    if (notesUsagePercent >= 70 && notesUsagePercent < 95) {
      incentives.push({
        type: 'limit-approaching',
        priority: 'medium',
        message: 'You\'re approaching your notes limit. Don\'t let caps slow you down!',
        trigger: 'approaching-limit',
        showNotification: true
      });
    }

    // Time-based incentive (after 7 days of usage)
    const accountAge = Math.floor(
      (new Date().getTime() - new Date(user?.created_at || 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (accountAge >= 7 && userTier === UserTier.SCHOLAR) {
      incentives.push({
        type: 'time-based',
        priority: 'low',
        message: 'Ready to supercharge your learning? See what you\'re missing!',
        trigger: 'week-old-user',
        showNotification: true,
        delaySeconds: 60
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return incentives.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }, [metrics, tierLimits, userTier, user]);

  // Trigger incentive display
  const triggerIncentive = useCallback((incentive: UpgradeIncentive) => {
    if (dismissedIncentives.includes(incentive.trigger)) return;

    const showIncentive = () => {
      setActiveIncentive(incentive);
    };

    if (incentive.delaySeconds) {
      setTimeout(showIncentive, incentive.delaySeconds * 1000);
    } else {
      showIncentive();
    }
  }, [dismissedIncentives]);

  // Dismiss incentive
  const dismissIncentive = useCallback((trigger: string) => {
    setDismissedIncentives(prev => [...prev, trigger]);
    setActiveIncentive(null);
    
    // Store dismissed incentives in localStorage
    try {
      const key = `dismissed-incentives-${user?.id}`;
      localStorage.setItem(key, JSON.stringify([...dismissedIncentives, trigger]));
    } catch (error) {
      console.error('Error storing dismissed incentives:', error);
    }
  }, [dismissedIncentives, user]);

  // Load dismissed incentives from storage
  useEffect(() => {
    if (!user) return;

    try {
      const key = `dismissed-incentives-${user.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setDismissedIncentives(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading dismissed incentives:', error);
    }
  }, [user]);

  // Fetch metrics on mount and user change
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-trigger incentives based on current state
  useEffect(() => {
    if (!metrics) return;

    const incentives = calculateIncentives();
    const topIncentive = incentives[0];
    
    if (topIncentive && !activeIncentive) {
      // Add small delay to avoid overwhelming user
      setTimeout(() => {
        triggerIncentive(topIncentive);
      }, 2000);
    }
  }, [metrics, calculateIncentives, triggerIncentive, activeIncentive]);

  return {
    metrics,
    activeIncentive,
    availableIncentives: calculateIncentives(),
    triggerIncentive,
    dismissIncentive,
    refreshMetrics: fetchMetrics
  };
};