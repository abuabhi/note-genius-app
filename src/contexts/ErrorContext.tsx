
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ErrorInfo {
  id: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  details?: any;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  addError: (message: string, type?: 'error' | 'warning' | 'info', details?: any) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
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
    setTimeout(() => {
      setErrors(prev => prev.filter(error => error.id !== newError.id));
    }, 5000);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};
