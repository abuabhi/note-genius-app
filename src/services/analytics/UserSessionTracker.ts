import { config } from '@/config/environment';
import { productionErrorTracker } from '../errorTracking/ProductionErrorTracker';
import { googleAnalyticsService } from './GoogleAnalyticsService';
import '@/types/gtag';

interface SessionData {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: string[];
  interactions: Array<{
    type: string;
    timestamp: number;
    data?: Record<string, any>;
  }>;
  performance: {
    slowComponents: string[];
    errorCount: number;
    lastError?: string;
  };
}

class UserSessionTracker {
  private session: SessionData;
  private activityTimer: NodeJS.Timeout | null = null;
  private saveInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean;
  private originalPushState: typeof history.pushState | null = null;
  private originalReplaceState: typeof history.replaceState | null = null;
  private activityEvents = ['click', 'scroll', 'keydown', 'mousemove'];
  private boundHandleUserActivity: () => void;
  private boundSaveSession: () => void;

  constructor() {
    this.isEnabled = config.features.enableAnalytics;
    this.session = this.createNewSession();
    this.boundHandleUserActivity = this.handleUserActivity.bind(this);
    this.boundSaveSession = () => this.saveSession();
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    // Track page navigation
    this.trackPageView(window.location.pathname);
    
    // Listen for route changes (for SPA navigation)
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      this.trackPageView(args[2] as string || window.location.pathname);
      return this.originalPushState!.apply(history, args);
    };
    
    history.replaceState = (...args) => {
      this.trackPageView(args[2] as string || window.location.pathname);
      return this.originalReplaceState!.apply(history, args);
    };

    // Track user activity
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.boundHandleUserActivity, { passive: true });
    });

    // Track when user becomes inactive
    this.resetActivityTimer();

    // Save session data periodically
    this.saveInterval = setInterval(() => this.saveSession(), 60000); // Every minute

    // Save session on page unload
    window.addEventListener('beforeunload', this.boundSaveSession);
  }

  private createNewSession(): SessionData {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: [],
      interactions: [],
      performance: {
        slowComponents: [],
        errorCount: 0,
      },
    };
  }

  private handleUserActivity = () => {
    this.session.lastActivity = Date.now();
    this.resetActivityTimer();
  };

  private resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    
    // Consider user inactive after 30 minutes
    this.activityTimer = setTimeout(() => {
      this.trackInteraction('session_inactive');
      this.saveSession();
    }, 30 * 60 * 1000);
  }

  trackPageView(path: string) {
    if (!this.isEnabled) return;
    
    this.session.pageViews.push(path);
    this.trackInteraction('page_view', { path });
    
    // Enhanced GA4 page tracking
    googleAnalyticsService.trackPageView(path, document.title, {
      session_type: this.getSessionType(path),
      user_tier: this.getUserTier()
    });
    
    if (config.isDevelopment) {
      console.log('📄 Page view tracked:', path);
    }
  }

  trackInteraction(type: string, data?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    this.session.interactions.push({
      type,
      timestamp: Date.now(),
      data,
    });

    // Enhanced GA4 interaction tracking
    if (type !== 'page_view') { // Avoid duplicate page view events
      googleAnalyticsService.trackEvent(type as any, {
        event_category: 'User Interaction',
        user_tier: this.getUserTier(),
        session_type: this.getCurrentSessionType(),
        ...data
      });
    }

    // Keep interactions list manageable
    if (this.session.interactions.length > 100) {
      this.session.interactions = this.session.interactions.slice(-50);
    }
  }

  trackError(component: string, error: string) {
    if (!this.isEnabled) return;
    
    this.session.performance.errorCount++;
    this.session.performance.lastError = error;
    this.trackInteraction('error', { component, error });
    
    // Enhanced GA4 error tracking
    googleAnalyticsService.trackEvent('study_error_encountered', {
      event_category: 'Error',
      event_label: component,
      custom_parameter_1: error,
      user_tier: this.getUserTier()
    });
  }

  trackSlowComponent(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;
    
    if (renderTime > 100 && !this.session.performance.slowComponents.includes(componentName)) {
      this.session.performance.slowComponents.push(componentName);
      this.trackInteraction('slow_component', { component: componentName, renderTime });
    }
  }

  setUserId(userId: string, userTier?: string) {
    this.session.userId = userId;
    
    // Initialize GA4 user properties
    if (userTier) {
      googleAnalyticsService.setUserProperties(userId, userTier);
    }
  }

  getSessionData(): SessionData {
    return { ...this.session };
  }

  private saveSession() {
    if (!this.isEnabled) return;
    
    try {
      const sessionData = {
        ...this.session,
        duration: Date.now() - this.session.startTime,
        savedAt: Date.now(),
      };

      if (config.isDevelopment) {
        console.log('💾 Session data saved:', sessionData);
        localStorage.setItem('user_session_data', JSON.stringify(sessionData));
      }
      
      // In production, this would send to analytics service
      // Example: await fetch('/api/analytics/session', { method: 'POST', body: JSON.stringify(sessionData) });
      
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  }

  // Public method to get session context for error reports
  getSessionContext() {
    return {
      sessionId: this.session.id,
      userId: this.session.userId,
      sessionDuration: Date.now() - this.session.startTime,
      pageViews: this.session.pageViews.length,
      interactions: this.session.interactions.length,
      errorCount: this.session.performance.errorCount,
    };
  }

  destroy() {
    // Clear activity timer
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    
    // Clear save interval
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    
    // Remove event listeners
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.boundHandleUserActivity);
    });
    window.removeEventListener('beforeunload', this.boundSaveSession);
    
    // Restore original history methods
    if (this.originalPushState) {
      history.pushState = this.originalPushState;
    }
    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState;
    }
    
    // Final save
    this.saveSession();
  }

  // Helper methods for GA4 integration
  private getSessionType(path: string): 'flashcard' | 'quiz' | 'notes' | 'planner' | 'goal_setting' {
    if (path.includes('/flashcards')) return 'flashcard';
    if (path.includes('/quiz')) return 'quiz';
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/planner')) return 'planner';
    if (path.includes('/goals')) return 'goal_setting';
    return 'notes'; // Default to notes instead of 'general'
  }

  private getCurrentSessionType(): 'flashcard' | 'quiz' | 'notes' | 'planner' | 'goal_setting' {
    return this.getSessionType(window.location.pathname);
  }

  private getUserTier(): 'SCHOLAR' | 'GRADUATE' | 'MASTER' | 'DEAN' {
    // This would be set when user logs in - for now return a default
    return 'SCHOLAR'; // Will be updated when user properties are set
  }

  // Enhanced tracking methods for study activities
  trackStudySessionStart(sessionType: 'flashcard' | 'quiz' | 'notes' | 'planner' | 'goal_setting', metadata?: Record<string, any>) {
    googleAnalyticsService.trackStudySession('start', {
      session_type: sessionType,
      user_tier: this.getUserTier(),
      ...metadata
    });
    this.trackInteraction('study_session_start', { sessionType, ...metadata });
  }

  trackStudySessionComplete(sessionType: 'flashcard' | 'quiz' | 'notes' | 'planner' | 'goal_setting', duration: number, metadata?: Record<string, any>) {
    googleAnalyticsService.trackStudySession('complete', {
      session_type: sessionType,
      session_duration: duration,
      user_tier: this.getUserTier(),
      ...metadata
    });
    this.trackInteraction('study_session_complete', { sessionType, duration, ...metadata });
  }
}

export const userSessionTracker = new UserSessionTracker();
