// Production-optimized console logging utility
// Replaces all console.log statements with conditional, categorized logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'api' | 'ui' | 'performance' | 'admin' | 'data' | 'system';

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  timestamp: number;
}

class ProductionConsole {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 50;

  // Core logging method - respects environment and categories
  private log(level: LogLevel, category: LogCategory, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      category,
      message,
      data,
      timestamp: Date.now()
    };

    // Always buffer for debugging (limited size)
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }

    // Console output rules:
    // - Production: Only errors and critical warnings
    // - Development: All levels with emoji categorization
    if (level === 'error') {
      console.error(`❌ [${category.toUpperCase()}]`, message, data || '');
    } else if (level === 'warn') {
      console.warn(`⚠️ [${category.toUpperCase()}]`, message, data || '');
    } else if (this.isDevelopment) {
      const emoji = this.getCategoryEmoji(category);
      const levelEmoji = level === 'info' ? 'ℹ️' : '🐛';
      console.log(`${emoji}${levelEmoji} [${category.toUpperCase()}]`, message, data || '');
    }
  }

  private getCategoryEmoji(category: LogCategory): string {
    const emojiMap: Record<LogCategory, string> = {
      auth: '🔐',
      api: '🌐',
      ui: '🎨',
      performance: '⚡',
      admin: '👑',
      data: '📊',
      system: '🔧'
    };
    return emojiMap[category] || '📝';
  }

  // Public API - categorized logging methods
  auth = {
    debug: (msg: string, data?: any) => this.log('debug', 'auth', msg, data),
    info: (msg: string, data?: any) => this.log('info', 'auth', msg, data),
    warn: (msg: string, data?: any) => this.log('warn', 'auth', msg, data),
    error: (msg: string, data?: any) => this.log('error', 'auth', msg, data),
  };

  api = {
    debug: (msg: string, data?: any) => this.log('debug', 'api', msg, data),
    info: (msg: string, data?: any) => this.log('info', 'api', msg, data),
    warn: (msg: string, data?: any) => this.log('warn', 'api', msg, data),
    error: (msg: string, data?: any) => this.log('error', 'api', msg, data),
  };

  ui = {
    debug: (msg: string, data?: any) => this.log('debug', 'ui', msg, data),
    info: (msg: string, data?: any) => this.log('info', 'ui', msg, data),
    warn: (msg: string, data?: any) => this.log('warn', 'ui', msg, data),
    error: (msg: string, data?: any) => this.log('error', 'ui', msg, data),
  };

  performance = {
    debug: (msg: string, data?: any) => this.log('debug', 'performance', msg, data),
    info: (msg: string, data?: any) => this.log('info', 'performance', msg, data),
    warn: (msg: string, data?: any) => this.log('warn', 'performance', msg, data),
    error: (msg: string, data?: any) => this.log('error', 'performance', msg, data),
  };

  admin = {
    debug: (msg: string, data?: any) => this.log('debug', 'admin', msg, data),
    info: (msg: string, data?: any) => this.log('info', 'admin', msg, data),
    warn: (msg: string, data?: any) => this.log('warn', 'admin', msg, data),
    error: (msg: string, data?: any) => this.log('error', 'admin', msg, data),
  };

  data = {
    debug: (msg: string, data?: any) => this.log('debug', 'data', msg, data),
    info: (msg: string, data?: any) => this.log('info', 'data', msg, data),
    warn: (msg: string, data?: any) => this.log('warn', 'data', msg, data),
    error: (msg: string, data?: any) => this.log('error', 'data', msg, data),
  };

  system = {
    debug: (msg: string, data?: any) => this.log('debug', 'system', msg, data),
    info: (msg: string, data?: any) => this.log('info', 'system', msg, data),
    warn: (msg: string, data?: any) => this.log('warn', 'system', msg, data),
    error: (msg: string, data?: any) => this.log('error', 'system', msg, data),
  };

  // Utility methods
  getLogs = () => [...this.logBuffer];
  clearLogs = () => { this.logBuffer = []; };
  
  // Direct replacement for console.log (DEPRECATED - use categorized methods)
  legacyLog = (message: string, ...args: any[]) => {
    if (this.isDevelopment) {
      console.log(message, ...args);
    }
  };
}

// Export singleton instance
export const pConsole = new ProductionConsole();

// Legacy console.log replacement - gradually migrate to categorized methods
export const devLog = pConsole.legacyLog;