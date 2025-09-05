import { useState, useCallback } from 'react';

interface ErrorInfo {
  id: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  details?: any;
}

export interface ErrorFormData {
  errors: ErrorInfo[];
  addError: (message: string, type?: 'error' | 'warning' | 'info', details?: any) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorForm = (): ErrorFormData => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error', details?: any) => {
    const newError: ErrorInfo = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date(),
      details
    };
    
    setErrors(prev => [...prev, newError]);
    
    // Auto-remove errors after 5 seconds
    const timeoutId = setTimeout(() => {
      setErrors(prev => prev.filter(error => error.id !== newError.id));
    }, 5000);

    // Return cleanup function for manual cleanup
    return () => clearTimeout(timeoutId);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors
  };
};