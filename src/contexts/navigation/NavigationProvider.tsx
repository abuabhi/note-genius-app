import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigationForm, NavigationFormData } from '@/hooks/useNavigationForm';

type NavigationContextType = NavigationFormData;

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const navigationForm = useNavigationForm();

  return (
    <NavigationContext.Provider value={navigationForm}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Export with alternate name for backward compatibility
export const useNavigationContext = useNavigation;