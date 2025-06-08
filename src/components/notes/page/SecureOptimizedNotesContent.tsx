
import React from 'react';
import { useOptimizedNotesWithSecurity } from '@/hooks/performance/useOptimizedNotesWithSecurity';
import SecurityErrorBoundary from '@/components/error/SecurityErrorBoundary';
import { SecurityMonitor } from '@/components/performance/SecurityMonitor';
import { OptimizedNotesContent } from './OptimizedNotesContent';

export const SecureOptimizedNotesContent = () => {
  const secureNotesHook = useOptimizedNotesWithSecurity();

  const handleSecurityViolation = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('🔒 Security violation detected:', error, errorInfo);
    
    // In a real app, you might want to:
    // - Report to security monitoring service
    // - Log user session details
    // - Trigger additional security checks
  };

  return (
    <SecurityErrorBoundary onSecurityViolation={handleSecurityViolation}>
      <div className="relative">
        {/* Pass the secure hook to the existing content component */}
        <OptimizedNotesContent />
        
        {/* Security monitor overlay */}
        {process.env.NODE_ENV === 'development' && <SecurityMonitor />}
      </div>
    </SecurityErrorBoundary>
  );
};
