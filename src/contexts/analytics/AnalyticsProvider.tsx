import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalyticsForm } from '@/hooks/useAnalyticsForm';

// Use the return type from the hook as the context type
type AnalyticsContextType = ReturnType<typeof useAnalyticsForm>;

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const analyticsForm = useAnalyticsForm();

  return (
    <AnalyticsContext.Provider value={analyticsForm}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};