import { config } from '@/config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  context: {
    url: string;
    sessionId?: string;
    userId?: string;
    component?: string;
  };
  stack?: string;
}

class ProductionLogger {
  private logQueue: LogEntry[] = [];
  private isEnabled: boolean;
  private sessionId: string;
  private flushInterval: NodeJS.Timeout | null = null;
  private boundFlush: () => void;

  constructor() {
    this.isEnabled = config.features.enableErrorReporting;
    this.sessionId = `log_session_${Date.now()}`;
    this.boundFlush = () => this.flush();
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    // Flush logs periodically
    this.flushInterval = setInterval(this.boundFlush, 30000);
    
    // Flush on page unload
    window.addEventListener('beforeunload', this.boundFlush);
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    data?: Record<string, any>,
    context?: { component?: string; userId?: string }
  ): LogEntry {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      level,
      message,
      data,
      context: {
        url: window.location.href,
        sessionId: this.sessionId,
        userId: context?.userId,
        component: context?.component,
      },
      stack: level === 'error' || level === 'critical' ? new Error().stack : undefined,
    };
  }

  debug(message: string, data?: Record<string, any>, context?: { component?: string; userId?: string }) {
    if (!this.isEnabled) return;
    
    const entry = this.createLogEntry('debug', message, data, context);
    this.logQueue.push(entry);
    
    if (config.isDevelopment) {
      console.debug('🐛 [DEBUG]', message, data);
    }
  }

  info(message: string, data?: Record<string, any>, context?: { component?: string; userId?: string }) {
    if (!this.isEnabled) return;
    
    const entry = this.createLogEntry('info', message, data, context);
    this.logQueue.push(entry);
    
    if (config.isDevelopment) {
      console.info('ℹ️ [INFO]', message, data);
    }
  }

  warn(message: string, data?: Record<string, any>, context?: { component?: string; userId?: string }) {
    if (!this.isEnabled) return;
    
    const entry = this.createLogEntry('warn', message, data, context);
    this.logQueue.push(entry);
    
    console.warn('⚠️ [WARN]', message, data);
  }

  error(message: string, error?: Error | Record<string, any>, context?: { component?: string; userId?: string }) {
    if (!this.isEnabled) return;
    
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;
    
    const entry = this.createLogEntry('error', message, data, context);
    this.logQueue.push(entry);
    
    console.error('❌ [ERROR]', message, data);
    
    // Immediate flush for errors
    this.flush();
  }

  critical(message: string, error?: Error | Record<string, any>, context?: { component?: string; userId?: string }) {
    if (!this.isEnabled) return;
    
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;
    
    const entry = this.createLogEntry('critical', message, data, context);
    this.logQueue.push(entry);
    
    console.error('🚨 [CRITICAL]', message, data);
    
    // Immediate flush for critical errors
    this.flush();
  }

  private async flush() {
    if (this.logQueue.length === 0) return;
    
    const logs = [...this.logQueue];
    this.logQueue = [];
    
    try {
      await this.sendLogs(logs);
    } catch (error) {
      // If sending fails, put logs back in queue
      this.logQueue.unshift(...logs);
      
      if (config.isDevelopment) {
        console.error('Failed to send logs:', error);
      }
    }
  }

  private async sendLogs(logs: LogEntry[]) {
    if (config.isDevelopment) {
      console.log('📤 Sending logs:', logs);
      
      // Store in localStorage for development
      const existing = JSON.parse(localStorage.getItem('production_logs') || '[]');
      existing.push(...logs);
      
      // Keep only last 200 entries
      const recent = existing.slice(-200);
      localStorage.setItem('production_logs', JSON.stringify(recent));
    }
    
    // TODO: Replace with actual logging service integration
    // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logs) });
  }

  // Method to get logs for debugging
  getLogs(): LogEntry[] {
    return [...this.logQueue];
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    window.removeEventListener('beforeunload', this.boundFlush);
    this.flush();
  }
}

export const productionLogger = new ProductionLogger();

// Create a logger interface that matches console but adds production tracking
export const logger = {
  debug: (message: string, data?: Record<string, any>) => productionLogger.debug(message, data),
  info: (message: string, data?: Record<string, any>) => productionLogger.info(message, data),
  warn: (message: string, data?: Record<string, any>) => productionLogger.warn(message, data),
  error: (message: string, error?: Error | Record<string, any>) => productionLogger.error(message, error),
  critical: (message: string, error?: Error | Record<string, any>) => productionLogger.critical(message, error),
};
