
import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/queryClient';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NoteProvider } from '@/contexts/NoteContext';
import { FeatureProvider } from '@/contexts/FeatureContext';
import { FlashcardProvider } from '@/contexts/FlashcardContext';
import { AuthProvider } from '@/contexts/auth';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeatureProvider>
          <NavigationProvider>
            <NoteProvider>
              <FlashcardProvider>
                {children}
              </FlashcardProvider>
            </NoteProvider>
          </NavigationProvider>
        </FeatureProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
