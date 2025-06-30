import { config } from '@/config/environment';
import { productionErrorTracker } from '../errorTracking/ProductionErrorTracker';

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
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = config.features.enableAnalytics;
    this.session = this.createNewSession();
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    // Track page navigation
    this.trackPageView(window.location.pathname);
    
    // Listen for route changes (for SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      this.trackPageView(args[2] as string || window.location.pathname);
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = (...args) => {
      this.trackPageView(args[2] as string || window.location.pathname);
      return originalReplaceState.apply(history, args);
    };

    // Track user activity
    const events = ['click', 'scroll', 'keydown', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, this.handleUserActivity, { passive: true });
    });

    // Track when user becomes inactive
    this.resetActivityTimer();

    // Save session data periodically
    setInterval(() => this.saveSession(), 60000); // Every minute

    // Save session on page unload
    window.addEventListener('beforeunload', () => this.saveSession());
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
  }

  trackSlowComponent(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;
    
    if (renderTime > 100 && !this.session.performance.slowComponents.includes(componentName)) {
      this.session.performance.slowComponents.push(componentName);
      this.trackInteraction('slow_component', { component: componentName, renderTime });
    }
  }

  setUserId(userId: string) {
    this.session.userId = userId;
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
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    this.saveSession();
  }
}

export const userSessionTracker = new UserSessionTracker();
