
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import { FlashcardProvider } from '@/contexts/flashcards';
import { NoteProvider } from '@/contexts/NoteContext';
import { HelpProvider } from '@/contexts/HelpContext';
import { GuideProvider } from '@/contexts/GuideContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <FlashcardProvider>
            <NoteProvider>
              <HelpProvider>
                <GuideProvider>
                  {children}
                </GuideProvider>
              </HelpProvider>
            </NoteProvider>
          </FlashcardProvider>
        </AuthProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
