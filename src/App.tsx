import React, { useEffect } from 'react';
import AppRoutes from '@/routes/AppRoutes';
import { AuthProvider } from '@/contexts/auth';
import { HelpProvider } from '@/contexts/HelpContext';
import { FlashcardsProvider } from '@/contexts/flashcards';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { EnhancedQueryProvider } from './contexts/query';
import { checkEnvironmentVariables } from './utils/checkEnvVars';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';
import { runDatabaseSeed } from './utils/databaseSeeder';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

function App() {
  return (
    <EnhancedQueryProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <OptimizedNotesProvider>
            <FlashcardsProvider>
              <HelpProvider>
                <div className="min-h-screen bg-gray-50">
                  <AppRoutes />
                </div>
              </HelpProvider>
            </FlashcardsProvider>
          </OptimizedNotesProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </EnhancedQueryProvider>
  );
}

export default App;
