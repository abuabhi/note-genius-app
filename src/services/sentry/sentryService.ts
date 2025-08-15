import { supabase } from '@/integrations/supabase/client';

// Sentry-like service for error tracking and performance monitoring
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

      this.isInitialized = true;
      console.log('✅ Sentry initialized successfully');
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
      // In a real Sentry integration, this would send to Sentry API
      this.sendToSentry('error', {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        context,
        level: 'error'
      });
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
      this.sendToSentry('message', {
        message,
        level,
        timestamp: Date.now(),
        context
      });
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
      this.sendToSentry('breadcrumb', {
        ...breadcrumb,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Failed to add breadcrumb:', e);
    }
  }

  startTransaction(name: string, operation: string) {
    const startTime = performance.now();
    
    return {
      setTag: (key: string, value: string) => {
        // Store tags for the transaction
      },
      setData: (key: string, value: any) => {
        // Store additional data
      },
      finish: () => {
        const duration = performance.now() - startTime;
        
        if (this.isInitialized) {
          this.sendToSentry('transaction', {
            name,
            operation,
            duration,
            timestamp: Date.now()
          });
        } else {
          console.log(`Transaction: ${name} (${operation}) - ${duration.toFixed(2)}ms`);
        }
      }
    };
  }

  private async sendToSentry(type: string, data: any) {
    try {
      // Simulate sending to Sentry API
      console.log(`📊 [SENTRY ${type.toUpperCase()}]`, data);
      
      // Store in localStorage for debugging
      const stored = JSON.parse(localStorage.getItem('sentry_events') || '[]');
      stored.push({ type, data, timestamp: Date.now() });
      
      // Keep only last 100 events
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      
      localStorage.setItem('sentry_events', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to send to Sentry:', error);
    }
  }

  // Test methods for demonstration
  testError() {
    throw new Error('Test error for Sentry integration');
  }

  testPerformance() {
    const transaction = this.startTransaction('test-operation', 'manual');
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
