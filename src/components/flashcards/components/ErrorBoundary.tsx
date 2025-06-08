
import React from 'react';
import EnhancedErrorBoundary from '@/components/error/EnhancedErrorBoundary';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

// Updated to use the new enhanced error boundary
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  return (
    <EnhancedErrorBoundary
      fallback={fallback}
      maxRetries={3}
      enableReporting={true}
      onError={(error, errorInfo) => {
        // Log to console for debugging
        console.error('Flashcard ErrorBoundary:', error, errorInfo);
        
        // In production, this would send to error reporting service
        if (process.env.NODE_ENV === 'production') {
          // Example: Send to error reporting service
          // errorReportingService.captureException(error, { extra: errorInfo });
        }
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default ErrorBoundary;
