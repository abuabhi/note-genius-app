
import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';

interface SecurityConfig {
  maxRequestsPerMinute: number;
  maxDataSize: number;
  allowedOrigins: string[];
  enableCSRFProtection: boolean;
}

interface SecurityMetrics {
  requestCount: number;
  blockedRequests: number;
  lastReset: number;
  suspiciousActivity: string[];
}

export const useSecurityValidation = (config: SecurityConfig = {
  maxRequestsPerMinute: 60,
  maxDataSize: 1024 * 1024, // 1MB
  allowedOrigins: ['http://localhost:3000', 'https://your-app.com'],
  enableCSRFProtection: true
}) => {
  const { user } = useAuth();
  const metricsRef = useRef<SecurityMetrics>({
    requestCount: 0,
    blockedRequests: 0,
    lastReset: Date.now(),
    suspiciousActivity: []
  });

  // Rate limiting
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const metrics = metricsRef.current;
    
    // Reset counter every minute
    if (now - metrics.lastReset > 60000) {
      metrics.requestCount = 0;
      metrics.lastReset = now;
    }
    
    metrics.requestCount++;
    
    if (metrics.requestCount > config.maxRequestsPerMinute) {
      metrics.blockedRequests++;
      metrics.suspiciousActivity.push(`Rate limit exceeded at ${new Date(now).toISOString()}`);
      console.warn('🚫 Rate limit exceeded');
      return false;
    }
    
    return true;
  }, [config.maxRequestsPerMinute]);

  // Input sanitization
  const sanitizeInput = useCallback((input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/style="[^"]*"/gi, '') // Remove inline styles
      .trim()
      .slice(0, 10000); // Limit length
  }, []);

  // Data validation
  const validateData = useCallback((data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check data size
    const dataSize = JSON.stringify(data).length;
    if (dataSize > config.maxDataSize) {
      errors.push(`Data size ${dataSize} exceeds maximum ${config.maxDataSize}`);
    }
    
    // Validate user authorization
    if (!user) {
      errors.push('User not authenticated');
    }
    
    // Check for potentially malicious content
    const dataString = JSON.stringify(data).toLowerCase();
    const suspiciousPatterns = [
      'javascript:',
      '<script',
      'document.cookie',
      'eval(',
      'function(',
      'constructor',
      '__proto__'
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (dataString.includes(pattern)) {
        errors.push(`Suspicious content detected: ${pattern}`);
        metricsRef.current.suspiciousActivity.push(
          `Malicious pattern "${pattern}" detected at ${new Date().toISOString()}`
        );
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [config.maxDataSize, user]);

  // CSRF token validation (simplified)
  const validateCSRFToken = useCallback((token: string): boolean => {
    if (!config.enableCSRFProtection) return true;
    
    // In a real implementation, this would validate against a server-generated token
    const expectedToken = sessionStorage.getItem('csrf-token');
    return token === expectedToken;
  }, [config.enableCSRFProtection]);

  // Origin validation
  const validateOrigin = useCallback((origin: string): boolean => {
    return config.allowedOrigins.includes(origin) || 
           config.allowedOrigins.includes('*');
  }, [config.allowedOrigins]);

  // Comprehensive security check
  const validateSecurityContext = useCallback((context: {
    data?: any;
    origin?: string;
    csrfToken?: string;
  }): { isSecure: boolean; violations: string[] } => {
    const violations: string[] = [];
    
    // Rate limiting
    if (!checkRateLimit()) {
      violations.push('Rate limit exceeded');
    }
    
    // Data validation
    if (context.data) {
      const dataValidation = validateData(context.data);
      if (!dataValidation.isValid) {
        violations.push(...dataValidation.errors);
      }
    }
    
    // Origin validation
    if (context.origin && !validateOrigin(context.origin)) {
      violations.push(`Invalid origin: ${context.origin}`);
    }
    
    // CSRF validation
    if (context.csrfToken && !validateCSRFToken(context.csrfToken)) {
      violations.push('Invalid CSRF token');
    }
    
    return {
      isSecure: violations.length === 0,
      violations
    };
  }, [checkRateLimit, validateData, validateOrigin, validateCSRFToken]);

  // Get security metrics
  const getSecurityMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Reset security metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      requestCount: 0,
      blockedRequests: 0,
      lastReset: Date.now(),
      suspiciousActivity: []
    };
  }, []);

  return {
    sanitizeInput,
    validateData,
    validateSecurityContext,
    getSecurityMetrics,
    resetMetrics
  };
};
