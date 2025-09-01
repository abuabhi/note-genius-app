// Production-safe logging utility
// Replaces console.log statements with conditional logging

interface LogLevel {
  error: 'error';
  warn: 'warn';
  info: 'info';
  debug: 'debug';
}

const LOG_LEVELS: LogLevel = {
  error: 'error',
  warn: 'warn', 
  info: 'info',
  debug: 'debug'
};

class ProductionLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  // Error logging - always log errors
  error(message: string, ...args: any[]): void {
    console.error(`❌ ${message}`, ...args);
  }

  // Warning logging - always log warnings
  warn(message: string, ...args: any[]): void {
    console.warn(`⚠️ ${message}`, ...args);
  }

  // Info logging - only in development
  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  // Debug logging - only in development
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🐛 ${message}`, ...args);
    }
  }

  // Success logging - only in development
  success(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  // Progress logging - only in development
  progress(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🔄 ${message}`, ...args);
    }
  }

  // Target/Action logging - only in development
  target(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🎯 ${message}`, ...args);
    }
  }

  // Analysis/Investigation logging - only in development
  analysis(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  // Performance logging - only in development
  performance(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`⚡ ${message}`, ...args);
    }
  }

  // Raw console.log replacement - only in development
  log(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(message, ...args);
    }
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Helper function to replace console.log calls
export const devLog = (message: string, ...args: any[]): void => {
  logger.log(message, ...args);
};