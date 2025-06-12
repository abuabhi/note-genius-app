
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { publicRoutes } from './routes/publicRoutes';
import { authCallbackRoutes } from './routes/authCallbackRoutes';
import { standardRoutes } from './routes/standardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import NotFoundPage from './pages/NotFoundPage';
import { OptimizedAppRoutes } from './components/optimized/OptimizedAppRoutes';
import { SessionProvider } from '@/contexts/SessionContext';
import { useStudyActivityDetector } from '@/hooks/useStudyActivityDetector';
import OptimizedNotesPage from "@/pages/OptimizedNotesPage";
import NoteStudyPage from "@/pages/NoteStudyPage";
import { NoteProvider } from '@/contexts/NoteContext';
import { HelpProvider } from '@/contexts/HelpContext';
import { GuideProvider } from '@/contexts/GuideContext';
import { ErrorProvider } from '@/contexts/ErrorContext';

// Create a QueryClient instance with optimized settings for high concurrency
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Component to handle study activity detection
const StudyActivityHandler = () => {
  useStudyActivityDetector();
  return null;
};

function App() {
  return (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <HelpProvider>
              <GuideProvider>
                <SessionProvider>
                  <StudyActivityHandler />
                  <Toaster position="top-right" />
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
                        
                        {/* Note study routes need NoteProvider */}
                        <Route path="/notes/study/:id" element={
                          <NoteProvider>
                            <NoteStudyPage />
                          </NoteProvider>
                        } />
                        
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
                  </Suspense>
                </SessionProvider>
              </GuideProvider>
            </HelpProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorProvider>
  );
}

export default App;
