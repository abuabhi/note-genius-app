
import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/queryClient';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NoteProvider } from '@/contexts/NoteContext';
import { FeatureProvider } from '@/contexts/FeatureContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <NoteProvider>
          <FeatureProvider>
            {children}
          </FeatureProvider>
        </NoteProvider>
      </NavigationProvider>
    </QueryClientProvider>
  );
};
