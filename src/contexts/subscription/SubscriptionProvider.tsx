import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscriptionForm, SubscriptionFormData } from '@/hooks/useSubscriptionForm';

type SubscriptionContextType = SubscriptionFormData;

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const subscriptionForm = useSubscriptionForm();

  return (
    <SubscriptionContext.Provider value={subscriptionForm}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};