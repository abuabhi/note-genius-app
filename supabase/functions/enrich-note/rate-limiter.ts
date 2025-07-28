// Rate limiting for edge function
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockUntil?: number;
  };
}

// In-memory store for the edge function (simplified for demo)
const rateLimitStore: RateLimitStore = {};

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  'enhancement': { maxRequests: 5, windowMs: 60000, blockDurationMs: 300000 }, // 5 per minute, 5min block
  'free_tier': { maxRequests: 3, windowMs: 300000, blockDurationMs: 600000 }, // 3 per 5min, 10min block
  'premium_tier': { maxRequests: 10, windowMs: 60000, blockDurationMs: 180000 }, // 10 per minute, 3min block
};

export function checkRateLimit(
  userId: string, 
  userTier: string = 'SCHOLAR'
): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
  const configType = ['MASTER', 'DEAN'].includes(userTier) ? 'premium_tier' : 'free_tier';
  const config = rateLimitConfigs[configType] || rateLimitConfigs['free_tier'];
  
  const key = `${userId}_${configType}`;
  const now = Date.now();
  
  // Initialize or get existing entry
  let entry = rateLimitStore[key];
  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false
    };
    rateLimitStore[key] = entry;
  }

  // Check if currently blocked
  if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
    const remainingBlockTime = Math.ceil((entry.blockUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: `Rate limit exceeded. Try again in ${remainingBlockTime} seconds.`
    };
  }

  // Reset window if expired
  if (now >= entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;
    entry.blocked = false;
    entry.blockUntil = undefined;
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    entry.blocked = true;
    entry.blockUntil = now + config.blockDurationMs;
    rateLimitStore[key] = entry;
    
    const blockMinutes = Math.ceil(config.blockDurationMs / 60000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: `Rate limit exceeded. You're temporarily blocked for ${blockMinutes} minutes.`
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore[key] = entry;

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime
  };
}

// Cleanup function to remove expired entries (call periodically)
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of Object.entries(rateLimitStore)) {
    // Remove expired entries
    if (now >= entry.resetTime && !entry.blocked) {
      keysToDelete.push(key);
    }
    // Remove entries that are no longer blocked
    else if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => delete rateLimitStore[key]);
  
  if (keysToDelete.length > 0) {
    console.log(`🧹 Rate limit cleanup: removed ${keysToDelete.length} expired entries`);
  }
}

// Get current rate limit status for debugging
export function getRateLimitStatus(userId: string, userTier: string = 'SCHOLAR') {
  const configType = ['MASTER', 'DEAN'].includes(userTier) ? 'premium_tier' : 'free_tier';
  const key = `${userId}_${configType}`;
  const entry = rateLimitStore[key];
  
  if (!entry) {
    return {
      hasEntry: false,
      remaining: rateLimitConfigs[configType].maxRequests,
      blocked: false
    };
  }

  const now = Date.now();
  const isBlocked = entry.blocked && entry.blockUntil && now < entry.blockUntil;
  
  return {
    hasEntry: true,
    count: entry.count,
    remaining: Math.max(0, rateLimitConfigs[configType].maxRequests - entry.count),
    blocked: isBlocked,
    resetTime: entry.resetTime,
    blockUntil: entry.blockUntil
  };
}