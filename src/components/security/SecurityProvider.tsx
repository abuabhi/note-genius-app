
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { securityHeadersManager } from '@/services/security/SecurityHeadersManager';
import { rateLimitingService } from '@/services/security/RateLimitingService';
import { useAuth } from '@/hooks/auth/useAuth';
import { logger } from '@/services/logging/ProductionLogger';
import { config } from '@/config/environment';

interface SecurityContextType {
  checkRateLimit: (action: string, type?: string) => boolean;
  sanitizeInput: (input: string) => string;
  validateSecurityContext: (context: any) => { isSecure: boolean; violations: string[] };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize security headers
    securityHeadersManager;
    
    // Set up CSP violation reporting
    if (config.features.enableErrorReporting) {
      document.addEventListener('securitypolicyviolation', (event) => {
        logger.warn('CSP Violation detected', {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          documentURI: event.documentURI,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber,
          columnNumber: event.columnNumber,
        });
      });
    }

    // Monitor for suspicious activities
    const monitorSuspiciousActivity = () => {
      // Check for rapid consecutive requests
      let requestCount = 0;
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        requestCount++;
        
        if (requestCount > 10) {
          logger.warn('Suspicious activity: Rapid API requests detected', {
            count: requestCount,
            userId: user?.id,
          });
        }
        
        // Reset counter after 1 minute
        setTimeout(() => {
          requestCount = Math.max(0, requestCount - 1);
        }, 60000);
        
        return originalFetch(...args);
      };
    };

    monitorSuspiciousActivity();
  }, [user?.id]);

  const checkRateLimit = (action: string, type: string = 'default'): boolean => {
    const userKey = rateLimitingService.getUserKey(user?.id);
    const key = `${userKey}:${action}`;
    return rateLimitingService.checkRateLimit(key, type);
  };

  const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/style="[^"]*"/gi, '') // Remove inline styles
      .trim()
      .slice(0, 10000); // Limit length
  };

  const validateSecurityContext = (context: any): { isSecure: boolean; violations: string[] } => {
    const violations: string[] = [];
    
    // Check for potentially malicious content
    if (context && typeof context === 'object') {
      const contextString = JSON.stringify(context).toLowerCase();
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
        if (contextString.includes(pattern)) {
          violations.push(`Suspicious content detected: ${pattern}`);
        }
      });
    }
    
    return {
      isSecure: violations.length === 0,
      violations
    };
  };

  const contextValue: SecurityContextType = {
    checkRateLimit,
    sanitizeInput,
    validateSecurityContext,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
