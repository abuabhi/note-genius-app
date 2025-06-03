
import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/queryClient';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NoteProvider } from '@/contexts/NoteContext';
import { FeatureProvider } from '@/contexts/FeatureContext';
import { AuthProvider } from '@/contexts/auth';
import { FlashcardProvider } from '@/contexts/FlashcardContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeatureProvider>
          <FlashcardProvider>
            <NavigationProvider>
              <NoteProvider>
                {children}
              </NoteProvider>
            </NavigationProvider>
          </FlashcardProvider>
        </FeatureProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
