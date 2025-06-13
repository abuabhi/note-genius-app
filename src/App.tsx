
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { publicRoutes } from './routes/publicRoutes';
import { authCallbackRoutes } from './routes/authCallbackRoutes';
import { standardRoutes } from './routes/standardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import NotFoundPage from './pages/NotFoundPage';
import { OptimizedAppRoutes } from './components/optimized/OptimizedAppRoutes';
import OptimizedNotesPage from "@/pages/OptimizedNotesPage";
import OptimizedNoteStudyPage from "@/pages/OptimizedNoteStudyPage";
import { NoteProvider } from '@/contexts/NoteContext';
import { HelpProvider } from '@/contexts/HelpContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { AppProviders } from '@/components/app/AppProviders';
import { FlashcardProvider } from '@/contexts/flashcards';
import { SessionDock } from '@/components/ui/floating/SessionDock';
import { LightweightPerformanceOverlay } from '@/components/performance/LightweightPerformanceOverlay';

// Optimized QueryClient with better cache management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <FlashcardProvider>
              <HelpProvider>
                <AppProviders>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      {/* Auth callback routes MUST be first and completely public - no auth required */}
                      {authCallbackRoutes.map((route, index) => (
                        <Route key={`auth-callback-${index}`} path={route.path} element={route.element} />
                      ))}
                      
                      {/* Public routes */}
                      {publicRoutes.map((route, index) => (
                        <Route key={`public-${index}`} path={route.path} element={route.element} />
                      ))}
                      
                      {/* Protected Routes */}
                      <Route element={<ProtectedRoute />}>
                        {/* Replace the notes route with optimized version */}
                        <Route path="/notes" element={<OptimizedNotesPage />} />
                        <Route path="/notes/:noteId" element={<OptimizedNotesPage />} />
                        
                        {/* Note study routes - now using OptimizedNoteStudyPage */}
                        <Route path="/notes/study/:id" element={<OptimizedNoteStudyPage />} />
                        
                        {/* Standard protected routes */}
                        {standardRoutes.map((route, index) => (
                          <Route key={`standard-${index}`} path={route.path} element={route.element} />
                        ))}
                      </Route>
                      
                      {/* Admin Routes */}
                      <Route element={<AdminRoute />}>
                        {adminRoutes.map((route, index) => (
                          <Route key={`admin-${index}`} path={route.path} element={route.element} />
                        ))}
                      </Route>
                      
                      {/* Not Found Route - this should be last */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    
                    {/* Global Session Dock - shows on all authenticated pages */}
                    <SessionDock />
                    
                    {/* Lightweight Performance Overlay - only in development */}
                    <LightweightPerformanceOverlay />
                  </Suspense>
                </AppProviders>
              </HelpProvider>
            </FlashcardProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorProvider>
  );
}

export default App;
