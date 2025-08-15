import { config } from '@/config/environment';

// GA4 Event Parameters Interface
export interface GA4EventParams {
  // User properties
  user_tier?: 'SCHOLAR' | 'GRADUATE' | 'MASTER' | 'DEAN';
  user_id?: string;
  
  // Session properties
  session_type?: 'flashcard' | 'quiz' | 'notes' | 'planner' | 'goal_setting';
  study_subject?: string;
  session_duration?: number;
  
  // Flashcard events
  flashcard_set_id?: string;
  cards_reviewed?: number;
  cards_correct?: number;
  accuracy_rate?: number;
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'again';
  study_mode?: 'study' | 'review' | 'quick_review';
  
  // Quiz events
  quiz_id?: string;
  quiz_type?: 'flashcard_quiz' | 'ai_generated_quiz';
  score?: number;
  total_questions?: number;
  pass_rate?: number;
  
  // Goal and progress events
  goal_type?: 'daily_time' | 'weekly_time' | 'cards_reviewed' | 'accuracy_target';
  goal_value?: number;
  achievement_percentage?: number;
  streak_days?: number;
  
  // Content creation
  content_type?: 'note' | 'flashcard' | 'flashcard_set' | 'study_plan' | 'goal';
  ai_generated?: boolean;
  word_count?: number;
  
  // Conversion events
  from_tier?: string;
  to_tier?: string;
  conversion_value?: number;
  conversion_method?: string;
  
  // General event properties
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter_1?: string;
  custom_parameter_2?: string;
  page_location?: string;
  page_title?: string;
  timestamp?: number;
}

// GA4 Custom Events
export type GA4CustomEvent = 
  // Study Session Events
  | 'study_session_start'
  | 'study_session_pause'
  | 'study_session_resume' 
  | 'study_session_complete'
  | 'study_session_abandon'
  
  // Flashcard Study Events
  | 'flashcard_study_start'
  | 'flashcard_card_review'
  | 'flashcard_card_correct'
  | 'flashcard_card_incorrect'
  | 'flashcard_study_complete'
  | 'flashcard_set_mastered'
  | 'flashcard_difficulty_selected'
  
  // Quiz Events
  | 'quiz_attempt_start'
  | 'quiz_question_answered'
  | 'quiz_attempt_complete'
  | 'quiz_attempt_abandon'
  | 'quiz_perfect_score'
  
  // Content Creation Events
  | 'note_created'
  | 'note_ai_enriched'
  | 'flashcard_created'
  | 'flashcard_set_created'
  | 'flashcard_ai_generated'
  | 'study_plan_created'
  | 'goal_created'
  
  // Achievement Events
  | 'goal_achieved'
  | 'daily_goal_reached'
  | 'weekly_goal_reached'
  | 'study_streak_milestone'
  | 'accuracy_milestone'
  | 'cards_mastered_milestone'
  
  // User Engagement Events
  | 'feature_discovered'
  | 'onboarding_step_completed'
  | 'daily_login'
  | 'return_after_absence'
  
  // Conversion Events
  | 'tier_upgrade_initiated'
  | 'tier_upgrade_completed'
  | 'premium_feature_attempted'
  | 'subscription_converted'
  
  // Error and Performance Events
  | 'study_error_encountered'
  | 'performance_issue_detected'
  | 'feature_timeout';

class GoogleAnalyticsService {
  private isEnabled: boolean;
  private userId: string | null = null;
  private userTier: string | null = null;

  constructor() {
    this.isEnabled = config.features.enableAnalytics && typeof window !== 'undefined' && !!window.gtag;
    
    if (this.isEnabled && config.isDevelopment) {
      console.log('🔵 GA4 Enhanced Tracking initialized');
    }
  }

  // Initialize user properties
  setUserProperties(userId: string, userTier: string, additionalProperties?: Record<string, any>) {
    if (!this.isEnabled) return;

    this.userId = userId;
    this.userTier = userTier;

    try {
      // Set user ID (hashed for privacy)
      const hashedUserId = this.hashUserId(userId);
      window.gtag('config', 'G-QSXFSSYFWF', {
        user_id: hashedUserId,
        custom_map: {
          custom_dimension_1: 'user_tier',
          custom_dimension_2: 'study_subject',
          custom_dimension_3: 'session_type',
          custom_dimension_4: 'engagement_level'
        }
      });

      // Set user properties
      window.gtag('set', 'user_properties', {
        user_tier: userTier,
        signup_method: 'direct',
        ...additionalProperties
      });

      if (config.isDevelopment) {
        console.log('🔵 GA4 User properties set:', { userId: hashedUserId, userTier, ...additionalProperties });
      }
    } catch (error) {
      console.error('GA4 Error setting user properties:', error);
    }
  }

  // Track custom events
  trackEvent(eventName: GA4CustomEvent, parameters: GA4EventParams = {}) {
    if (!this.isEnabled) return;

    try {
      const enhancedParams = {
        ...parameters,
        user_tier: parameters.user_tier || this.userTier,
        timestamp: Date.now(),
        page_location: window.location.href,
        page_title: document.title
      };

      window.gtag('event', eventName, enhancedParams);

      if (config.isDevelopment) {
        console.log('🔵 GA4 Event tracked:', eventName, enhancedParams);
      }
    } catch (error) {
      console.error('GA4 Error tracking event:', error);
    }
  }

  // Track conversion events
  trackConversion(eventName: string, value?: number, currency: string = 'USD') {
    if (!this.isEnabled) return;

    try {
      window.gtag('event', eventName, {
        value: value,
        currency: currency,
        user_tier: this.userTier,
      });

      if (config.isDevelopment) {
        console.log('🔵 GA4 Conversion tracked:', eventName, { value, currency });
      }
    } catch (error) {
      console.error('GA4 Error tracking conversion:', error);
    }
  }

  // Track page views with enhanced context
  trackPageView(path: string, title?: string, studyContext?: GA4EventParams) {
    if (!this.isEnabled) return;

    try {
      window.gtag('config', 'G-QSXFSSYFWF', {
        page_path: path,
        page_title: title || document.title
      });

      // Send enhanced page view event
      this.trackEvent('page_view' as GA4CustomEvent, {
        page_location: path,
        page_title: title,
        ...studyContext
      });
    } catch (error) {
      console.error('GA4 Error tracking page view:', error);
    }
  }

  // Track study session metrics
  trackStudySession(action: 'start' | 'complete' | 'pause' | 'abandon', sessionData: GA4EventParams) {
    const eventMap = {
      start: 'study_session_start',
      complete: 'study_session_complete',
      pause: 'study_session_pause',
      abandon: 'study_session_abandon'
    } as const;

    this.trackEvent(eventMap[action], {
      event_category: 'Study',
      ...sessionData
    });
  }

  // Track flashcard interactions
  trackFlashcardInteraction(action: string, flashcardData: GA4EventParams) {
    this.trackEvent(action as GA4CustomEvent, {
      event_category: 'Flashcard',
      ...flashcardData
    });
  }

  // Track quiz interactions
  trackQuizInteraction(action: string, quizData: GA4EventParams) {
    this.trackEvent(action as GA4CustomEvent, {
      event_category: 'Quiz',
      ...quizData
    });
  }

  // Track goal and achievement events
  trackGoalEvent(action: string, goalData: GA4EventParams) {
    this.trackEvent(action as GA4CustomEvent, {
      event_category: 'Goals',
      ...goalData
    });
  }

  // Track user tier changes
  trackTierChange(fromTier: string, toTier: string, method: 'upgrade' | 'promotion' = 'upgrade') {
    this.trackConversion('tier_upgrade_completed', 1);
    this.trackEvent('tier_upgrade_completed', {
      event_category: 'Conversion',
      from_tier: fromTier,
      to_tier: toTier,
      conversion_method: method
    });

    // Update user tier
    this.userTier = toTier;
    window.gtag('set', 'user_properties', {
      user_tier: toTier
    });
  }

  // Hash user ID for privacy compliance
  private hashUserId(userId: string): string {
    // Simple hash function for privacy - in production use a proper hash
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // Debug method for development
  getDebugInfo() {
    return {
      isEnabled: this.isEnabled,
      userId: this.userId,
      userTier: this.userTier,
      environment: config.name
    };
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();