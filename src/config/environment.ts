
// Environment configuration for different deployment stages
export interface EnvironmentConfig {
  name: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  supabase: {
    url: string;
    anonKey: string;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enablePerformanceMonitoring: boolean;
    enableCacheMonitor: boolean;
  };
  api: {
    timeout: number;
    retryAttempts: number;
    baseDelay: number;
  };
  cache: {
    defaultStaleTime: number;
    defaultCacheTime: number;
    enablePersistence: boolean;
  };
}

const getEnvironmentName = (): string => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  if (window.location.hostname.includes('staging') || window.location.hostname.includes('preview')) {
    return 'staging';
  }
  return 'production';
};

const environmentName = getEnvironmentName();

const baseConfig = {
  supabase: {
    url: "https://zuhcmwujzfddmafozubd.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw"
  }
};

const environments: Record<string, EnvironmentConfig> = {
  development: {
    name: 'development',
    isDevelopment: true,
    isProduction: false,
    isStaging: false,
    ...baseConfig,
    features: {
      enableAnalytics: false,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true,
      enableCacheMonitor: true,
    },
    api: {
      timeout: 10000,
      retryAttempts: 2,
      baseDelay: 1000,
    },
    cache: {
      defaultStaleTime: 30 * 1000, // 30 seconds
      defaultCacheTime: 5 * 60 * 1000, // 5 minutes
      enablePersistence: false,
    },
  },
  staging: {
    name: 'staging',
    isDevelopment: false,
    isProduction: false,
    isStaging: true,
    ...baseConfig,
    features: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true,
      enableCacheMonitor: false,
    },
    api: {
      timeout: 15000,
      retryAttempts: 3,
      baseDelay: 1500,
    },
    cache: {
      defaultStaleTime: 2 * 60 * 1000, // 2 minutes
      defaultCacheTime: 10 * 60 * 1000, // 10 minutes
      enablePersistence: true,
    },
  },
  production: {
    name: 'production',
    isDevelopment: false,
    isProduction: true,
    isStaging: false,
    ...baseConfig,
    features: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true,
      enableCacheMonitor: false,
    },
    api: {
      timeout: 20000,
      retryAttempts: 3,
      baseDelay: 2000,
    },
    cache: {
      defaultStaleTime: 5 * 60 * 1000, // 5 minutes
      defaultCacheTime: 30 * 60 * 1000, // 30 minutes
      enablePersistence: true,
    },
  },
};

export const config = environments[environmentName];

// Environment-specific logging
export const logger = {
  debug: (...args: any[]) => {
    if (config.isDevelopment) {
      console.log('🐛 [DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    console.log('ℹ️ [INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('⚠️ [WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('❌ [ERROR]', ...args);
    if (config.features.enableErrorReporting) {
      // In production, this would send to error reporting service
      // errorReportingService.captureException(args[0]);
    }
  },
};
