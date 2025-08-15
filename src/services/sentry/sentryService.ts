import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';

// Real Sentry service for error tracking and performance monitoring
class SentryService {
  private isInitialized = false;
  private dsn: string | null = null;

  async initialize() {
    try {
      // Get Sentry DSN from Supabase secrets
      const { data, error } = await supabase.functions.invoke('get-secret', {
        body: { secretName: 'SENTRY_DSN' }
      });

      if (error) {
        console.warn('Failed to load Sentry DSN:', error);
        return;
      }

      this.dsn = data?.value;
      if (!this.dsn) {
        console.warn('Sentry DSN not configured');
        return;
      }

      // Initialize real Sentry
      Sentry.init({
        dsn: this.dsn,
        environment: import.meta.env.MODE,
        beforeSend(event) {
          // Filter out development noise
          if (import.meta.env.MODE === 'development') {
            console.log('🚀 Sentry Event:', event);
          }
          return event;
        }
      });

      this.isInitialized = true;
      console.log('✅ Real Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.isInitialized) {
      console.warn('Sentry not initialized, logging error locally:', error);
      return;
    }

    try {
      // Set context if provided
      if (context) {
        Sentry.withScope((scope) => {
          Object.entries(context).forEach(([key, value]) => {
            scope.setContext(key, value);
          });
          Sentry.captureException(error);
        });
      } else {
        Sentry.captureException(error);
      }
    } catch (e) {
      console.error('Failed to capture exception:', e);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    if (!this.isInitialized) {
      console.log(`[${level.toUpperCase()}] ${message}`, context);
      return;
    }

    try {
      const sentryLevel = level === 'warning' ? 'warning' : level === 'error' ? 'error' : 'info';
      
      if (context) {
        Sentry.withScope((scope) => {
          Object.entries(context).forEach(([key, value]) => {
            scope.setContext(key, value);
          });
          Sentry.captureMessage(message, sentryLevel);
        });
      } else {
        Sentry.captureMessage(message, sentryLevel);
      }
    } catch (e) {
      console.error('Failed to capture message:', e);
    }
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }) {
    if (!this.isInitialized) return;

    try {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category,
        level: breadcrumb.level as any,
        data: breadcrumb.data,
        timestamp: Date.now() / 1000
      });
    } catch (e) {
      console.error('Failed to add breadcrumb:', e);
    }
  }

  startTransaction(name: string, operation: string) {
    const startTime = performance.now();
    
    if (!this.isInitialized) {
      return {
        setTag: () => {},
        setData: () => {},
        finish: () => {
          const duration = performance.now() - startTime;
          console.log(`Transaction: ${name} (${operation}) - ${duration.toFixed(2)}ms`);
        }
      };
    }

    // For now, use performance API since Sentry v7 has different transaction handling
    return {
      setTag: (key: string, value: string) => {
        // Store for potential use with Sentry.setTag
        Sentry.setTag(key, value);
      },
      setData: (key: string, value: any) => {
        // Store as context
        Sentry.setContext(key, value);
      },
      finish: () => {
        const duration = performance.now() - startTime;
        // Capture as custom metric
        Sentry.addBreadcrumb({
          message: `Performance: ${name}`,
          category: 'performance',
          level: 'info',
          data: { operation, duration: `${duration.toFixed(2)}ms` }
        });
      }
    };
  }

  // Legacy localStorage storage for testing dashboard compatibility
  private storeLegacyEvent(type: string, data: any) {
    try {
      const stored = JSON.parse(localStorage.getItem('sentry_events') || '[]');
      stored.push({ type, data, timestamp: Date.now() });
      
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      
      localStorage.setItem('sentry_events', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to store legacy event:', error);
    }
  }

  // Test methods for demonstration
  testError() {
    const error = new Error('Test error for Sentry integration');
    this.captureException(error, { testType: 'manual', source: 'testing-dashboard' });
    this.storeLegacyEvent('error', { message: error.message, stack: error.stack });
    throw error;
  }

  testPerformance() {
    const transaction = this.startTransaction('test-operation', 'manual');
    this.storeLegacyEvent('transaction', { name: 'test-operation', operation: 'manual' });
    setTimeout(() => {
      transaction.finish();
    }, Math.random() * 2000 + 500);
  }

  getSentryEvents() {
    return JSON.parse(localStorage.getItem('sentry_events') || '[]');
  }

  clearSentryEvents() {
    localStorage.removeItem('sentry_events');
  }
}

export const sentryService = new SentryService();
