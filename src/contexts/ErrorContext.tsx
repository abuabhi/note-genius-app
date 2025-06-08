
import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface ErrorInfo {
  id: string;
  error: Error;
  timestamp: Date;
  context?: string;
  retry?: () => void;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  reportError: (error: Error, context?: string, retry?: () => void) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
}

export const ErrorProvider = ({ children, maxErrors = 10 }: ErrorProviderProps) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const reportError = useCallback((error: Error, context?: string, retry?: () => void) => {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      timestamp: new Date(),
      context,
      retry
    };

    console.error(`🚨 Error reported [${context || 'Unknown'}]:`, error);

    setErrors(prev => {
      const newErrors = [errorInfo, ...prev].slice(0, maxErrors);
      return newErrors;
    });

    // Show toast notification
    toast.error(error.message || 'An unexpected error occurred', {
      duration: 5000,
      action: retry ? {
        label: 'Retry',
        onClick: retry
      } : undefined
    });
  }, [maxErrors]);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const hasErrors = errors.length > 0;

  const value: ErrorContextType = {
    errors,
    reportError,
    clearError,
    clearAllErrors,
    hasErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Hook for handling async operations with error reporting
export const useAsyncError = () => {
  const { reportError } = useError();

  const handleAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    retry?: () => void
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      reportError(error as Error, context, retry);
      return null;
    }
  }, [reportError]);

  return { handleAsync };
};
