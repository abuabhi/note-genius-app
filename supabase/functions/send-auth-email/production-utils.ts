// Production utilities for auth email function
export interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory rate limiting (for production, consider Redis)
const rateLimitStore: RateLimitStore = {};

export const checkRateLimit = (identifier: string, maxRequests = 5, windowMs = 60000): boolean => {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  if (rateLimitStore[key] && now > rateLimitStore[key].resetTime) {
    delete rateLimitStore[key];
  }
  
  // Initialize or increment counter
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }
  
  if (rateLimitStore[key].count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  rateLimitStore[key].count++;
  return true;
};

export const sanitizeEmail = (email: string): string => {
  // Basic email sanitization
  return email.trim().toLowerCase();
};

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const logSecurityEvent = (event: string, details: any): void => {
  console.log(`🔒 [SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const createSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};