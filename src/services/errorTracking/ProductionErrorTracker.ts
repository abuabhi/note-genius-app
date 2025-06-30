import { config } from '@/config/environment';

export interface ErrorReport {
  id: string;
  timestamp: number;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId: string;
    component?: string;
    action?: string;
    props?: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'auth' | 'database' | 'ui' | 'unknown';
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  id: string;
  timestamp: number;
  metrics: {
    type: 'page_load' | 'component_render' | 'api_call' | 'user_interaction';
    duration: number;
    name: string;
    success: boolean;
  };
  context: {
    url: string;
    userId?: string;
    sessionId: string;
    component?: string;
  };
  vitals?: {
    CLS?: number;  // Cumulative Layout Shift
    FID?: number;  // First Input Delay
    LCP?: number;  // Largest Contentful Paint
    TTFB?: number; // Time to First Byte
  };
}

class ProductionErrorTracker {
  private sessionId: string;
  private errorQueue: ErrorReport[] = [];
  private performanceQueue: PerformanceReport[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = config.features.enableErrorReporting;
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        component: 'Global',
        action: 'unhandled_error',
        props: { filename: event.filename, lineno: event.lineno, colno: event.colno }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        component: 'Global',
        action: 'unhandled_promise_rejection'
      });
    });

    // Start periodic flush
    this.flushInterval = setInterval(() => this.flush(), 30000); // Flush every 30 seconds
  }

  trackError(error: Error, context?: {
    component?: string;
    action?: string;
    props?: Record<string, any>;
    userId?: string;
  }) {
    if (!this.isEnabled) return;

    const report: ErrorReport = {
      id: this.generateId(),
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        userId: context?.userId,
        component: context?.component,
        action: context?.action,
        props: context?.props,
      },
      severity: this.calculateSeverity(error),
      category: this.categorizeError(error),
      metadata: {
        timestamp: new Date().toISOString(),
        buildVersion: '1.0.0', // Could be injected at build time
      },
    };

    this.errorQueue.push(report);
    
    // Immediate flush for critical errors
    if (report.severity === 'critical') {
      this.flush();
    }

    // Log to console in development
    if (config.isDevelopment) {
      console.error('🚨 Error tracked:', report);
    }
  }

  trackPerformance(metrics: {
    type: 'page_load' | 'component_render' | 'api_call' | 'user_interaction';
    duration: number;
    name: string;
    success: boolean;
    component?: string;
    userId?: string;
    vitals?: {
      CLS?: number;
      FID?: number;
      LCP?: number;
      TTFB?: number;
    };
  }) {
    if (!this.isEnabled) return;

    const report: PerformanceReport = {
      id: this.generateId(),
      timestamp: Date.now(),
      metrics,
      context: {
        url: window.location.href,
        sessionId: this.sessionId,
        userId: metrics.userId,
        component: metrics.component,
      },
      vitals: metrics.vitals,
    };

    this.performanceQueue.push(report);

    // Log to console in development
    if (config.isDevelopment) {
      console.log('📊 Performance tracked:', report);
    }
  }

  private calculateSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'medium';
    if (message.includes('auth') || message.includes('permission')) return 'high';
    if (message.includes('critical') || message.includes('fatal')) return 'critical';
    
    return 'low';
  }

  private categorizeError(error: Error): ErrorReport['category'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return 'auth';
    }
    if (message.includes('supabase') || message.includes('database') || message.includes('query')) {
      return 'database';
    }
    if (stack.includes('react') || message.includes('render') || message.includes('component')) {
      return 'ui';
    }
    
    return 'javascript';
  }

  private async flush() {
    if (this.errorQueue.length === 0 && this.performanceQueue.length === 0) return;

    const errors = [...this.errorQueue];
    const performance = [...this.performanceQueue];
    
    this.errorQueue = [];
    this.performanceQueue = [];

    try {
      // In production, this would send to a monitoring service
      // For now, we'll use a simple endpoint or local storage
      await this.sendToMonitoringService({ errors, performance });
    } catch (error) {
      // If sending fails, put the data back in queue for retry
      this.errorQueue.unshift(...errors);
      this.performanceQueue.unshift(...performance);
      
      if (config.isDevelopment) {
        console.error('Failed to send monitoring data:', error);
      }
    }
  }

  private async sendToMonitoringService(data: {
    errors: ErrorReport[];
    performance: PerformanceReport[];
  }) {
    // In production, this would integrate with services like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - Custom analytics endpoint
    
    if (config.isDevelopment) {
      console.log('📤 Sending monitoring data:', data);
      // Store in localStorage for development debugging
      const existing = JSON.parse(localStorage.getItem('production_monitoring') || '{"errors": [], "performance": []}');
      existing.errors.push(...data.errors);
      existing.performance.push(...data.performance);
      
      // Keep only last 100 entries to prevent localStorage bloat
      existing.errors = existing.errors.slice(-100);
      existing.performance = existing.performance.slice(-100);
      
      localStorage.setItem('production_monitoring', JSON.stringify(existing));
    }
    
    // TODO: Replace with actual monitoring service integration
    // Example: await fetch('/api/monitoring', { method: 'POST', body: JSON.stringify(data) });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public method to manually track user actions for context
  trackUserAction(action: string, details?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    this.trackPerformance({
      type: 'user_interaction',
      duration: 0,
      name: action,
      success: true,
      component: 'UserAction',
      ...details,
    });
  }

  // Cleanup method
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(); // Final flush
  }
}

export const productionErrorTracker = new ProductionErrorTracker();
