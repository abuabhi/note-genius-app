
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useActiveStudySessionData } from './useActiveStudySessionData';
import { toast } from 'sonner';

interface NotificationSettings {
  studyReminders: boolean;
  achievements: boolean;
  streakWarnings: boolean;
  browserNotifications: boolean;
  respectQuietHours: boolean;
  frequency: number; // 1-3 scale
  preferredTimes: string[]; // ['morning', 'lunch', 'evening']
  adaptiveLearning: boolean;
  lastUpdated: string;
}

interface AdaptiveInsights {
  hasRecommendations: boolean;
  suggestion: string;
  confidence: number;
  reasoning: string;
  recommendedChanges: Partial<NotificationSettings>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  studyReminders: true,
  achievements: true,
  streakWarnings: true,
  browserNotifications: false,
  respectQuietHours: true,
  frequency: 2,
  preferredTimes: ['morning', 'evening'],
  adaptiveLearning: true,
  lastUpdated: new Date().toISOString()
};

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const sessionData = useActiveStudySessionData();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [adaptiveInsights, setAdaptiveInsights] = useState<AdaptiveInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from user profile
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();

        if (profile?.notification_preferences) {
          const savedSettings = {
            ...DEFAULT_SETTINGS,
            ...profile.notification_preferences
          };
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Generate adaptive insights based on user behavior
  useEffect(() => {
    if (!user || !sessionData) return;

    const generateInsights = () => {
      const insights: AdaptiveInsights = {
        hasRecommendations: false,
        suggestion: '',
        confidence: 0,
        reasoning: '',
        recommendedChanges: {}
      };

      // Low engagement - suggest more reminders
      if (sessionData.todayProgress.completionPercentage < 25 && sessionData.hasActivePlans) {
        insights.hasRecommendations = true;
        insights.suggestion = "You might benefit from more frequent study reminders to stay on track.";
        insights.confidence = 0.8;
        insights.reasoning = "Low daily progress detected";
        insights.recommendedChanges = {
          frequency: Math.min(3, settings.frequency + 1),
          studyReminders: true
        };
      }
      
      // High engagement - suggest fewer interruptions
      else if (sessionData.todayProgress.completionPercentage > 90) {
        insights.hasRecommendations = true;
        insights.suggestion = "Great job! You might prefer fewer notifications since you're already consistent.";
        insights.confidence = 0.7;
        insights.reasoning = "High daily progress and consistency detected";
        insights.recommendedChanges = {
          frequency: Math.max(1, settings.frequency - 1)
        };
      }
      
      // Streak maintenance
      else if (sessionData.streakDays > 0 && !settings.streakWarnings) {
        insights.hasRecommendations = true;
        insights.suggestion = "Enable streak warnings to protect your learning momentum.";
        insights.confidence = 0.9;
        insights.reasoning = "Active streak detected but warnings disabled";
        insights.recommendedChanges = {
          streakWarnings: true
        };
      }

      setAdaptiveInsights(insights.hasRecommendations ? insights : null);
    };

    generateInsights();
  }, [sessionData, settings, user]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    const updatedSettings = {
      ...settings,
      ...newSettings,
      lastUpdated: new Date().toISOString()
    };

    setSettings(updatedSettings);

    try {
      await supabase
        .from('profiles')
        .update({
          notification_preferences: updatedSettings
        })
        .eq('id', user.id);

      console.log('Notification settings updated:', newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to save notification settings');
    }
  }, [user, settings]);

  // Apply AI recommendations
  const applyRecommendations = useCallback(() => {
    if (!adaptiveInsights?.recommendedChanges) return;

    updateSettings(adaptiveInsights.recommendedChanges);
    setAdaptiveInsights(null);
    toast.success('AI recommendations applied!');
  }, [adaptiveInsights, updateSettings]);

  // Get effective settings (considering time-based rules)
  const getEffectiveSettings = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();

    // Apply quiet hours
    if (settings.respectQuietHours && (currentHour < 8 || currentHour > 21)) {
      return {
        ...settings,
        studyReminders: false,
        achievements: false,
        browserNotifications: false
      };
    }

    return settings;
  }, [settings]);

  return {
    settings,
    updateSettings,
    adaptiveInsights,
    isLoading,
    applyRecommendations,
    getEffectiveSettings
  };
};
