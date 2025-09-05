import React, { createContext, useContext, ReactNode } from 'react';
import { useErrorForm, ErrorFormData } from '@/hooks/useErrorForm';

type ErrorContextType = ErrorFormData;

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const errorForm = useErrorForm();

  return (
    <ErrorContext.Provider value={errorForm}>
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