
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth';
import { FlashcardProvider } from '@/contexts/flashcards/index';
import { FeatureProvider } from '@/contexts/FeatureContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NoteProvider } from '@/contexts/NoteContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeatureProvider>
          <NavigationProvider>
            <NoteProvider>
              <FlashcardProvider>
                {children}
                <Toaster />
              </FlashcardProvider>
            </NoteProvider>
          </NavigationProvider>
        </FeatureProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
