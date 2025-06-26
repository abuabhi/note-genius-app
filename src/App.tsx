
import React from 'react';
import AppRoutes from '@/components/app/AppRoutes';
import { AuthProvider } from '@/contexts/auth';
import { HelpProvider } from '@/contexts/HelpContext';
import { FlashcardProvider } from '@/contexts/flashcards';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { EnhancedQueryProvider } from './contexts/query';
import { Toaster } from 'sonner';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

function App() {
  return (
    <EnhancedQueryProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <OptimizedNotesProvider>
            <FlashcardProvider>
              <HelpProvider>
                <div className="min-h-screen bg-gray-50">
                  <AppRoutes />
                  <Toaster />
                </div>
              </HelpProvider>
            </FlashcardProvider>
          </OptimizedNotesProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </EnhancedQueryProvider>
  );
}

export default App;
