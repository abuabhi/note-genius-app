
import { config } from '@/config/environment';
import { logger } from '@/services/logging/ProductionLogger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

class RateLimitingService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    blockDurationMs: 300000, // 5 minutes
  };

  private configs: Record<string, RateLimitConfig> = {
    'auth': { maxRequests: 5, windowMs: 60000, blockDurationMs: 900000 }, // 15 min block
    'api': { maxRequests: 60, windowMs: 60000, blockDurationMs: 300000 },
    'form': { maxRequests: 10, windowMs: 60000, blockDurationMs: 60000 },
    'search': { maxRequests: 30, windowMs: 60000, blockDurationMs: 120000 },
  };

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  checkRateLimit(key: string, type: string = 'default'): boolean {
    if (!config.features.enableErrorReporting) return true; // Disabled in development
    
    const config = this.configs[type] || this.defaultConfig;
    const now = Date.now();
    const entry = this.limits.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false
    };

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      logger.warn('Rate limit: Request blocked', {
        key,
        type,
        remainingBlockTime: entry.blockUntil - now
      });
      return false;
    }

    // Reset window if expired
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + config.blockDurationMs;
      
      logger.warn('Rate limit exceeded', {
        key,
        type,
        count: entry.count,
        limit: config.maxRequests,
        blockDuration: config.blockDurationMs
      });

      this.limits.set(key, entry);
      return false;
    }

    this.limits.set(key, entry);
    return true;
  }

  getRateLimitStatus(key: string, type: string = 'default'): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  } {
    const config = this.configs[type] || this.defaultConfig;
    const entry = this.limits.get(key);
    
    if (!entry) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        blocked: false
      };
    }

    const now = Date.now();
    const isBlocked = entry.blocked && entry.blockUntil && now < entry.blockUntil;
    
    return {
      allowed: !isBlocked && entry.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: isBlocked
    };
  }

  // Create a rate-limited function wrapper
  createRateLimited<T extends (...args: any[]) => any>(
    fn: T,
    key: string,
    type: string = 'default'
  ): T {
    return ((...args: any[]) => {
      if (!this.checkRateLimit(key, type)) {
        throw new Error(`Rate limit exceeded for ${type}. Please try again later.`);
      }
      return fn(...args);
    }) as T;
  }

  // Progressive delay for failed attempts
  getProgressiveDelay(attempts: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempts - 1), maxDelay);
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      // Remove expired entries
      if (now >= entry.resetTime && !entry.blocked) {
        toDelete.push(key);
      }
      // Remove entries that are no longer blocked
      else if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.limits.delete(key));
    
    if (toDelete.length > 0) {
      logger.debug('Rate limiting cleanup', { removedEntries: toDelete.length });
    }
  }

  // Get user identifier for rate limiting
  getUserKey(userId?: string): string {
    if (userId) return `user:${userId}`;
    
    // Fallback to IP-based identification (simplified for client-side)
    return `session:${this.getSessionId()}`;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('rate_limit_session');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('rate_limit_session', sessionId);
    }
    return sessionId;
  }

  // Public method to clear rate limits (for testing or admin override)
  clearRateLimit(key: string): void {
    this.limits.delete(key);
    logger.info('Rate limit cleared', { key });
  }
}

export const rateLimitingService = new RateLimitingService();
