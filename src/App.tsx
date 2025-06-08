
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { publicRoutes } from './routes/publicRoutes';
import { standardRoutes } from './routes/standardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import NotFoundPage from './pages/NotFoundPage';
import { OptimizedAppRoutes } from './components/optimized/OptimizedAppRoutes';
import { SessionProvider } from '@/contexts/SessionContext';
import { useStudyActivityDetector } from '@/hooks/useStudyActivityDetector';
import OptimizedNotesPage from "@/pages/OptimizedNotesPage";

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
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SessionProvider>
            <StudyActivityHandler />
            <Toaster position="top-right" />
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {publicRoutes.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} />
                ))}
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  {/* Replace the notes route with optimized version */}
                  <Route path="/notes" element={<OptimizedNotesPage />} />
                  <Route path="/notes/:noteId" element={<OptimizedNotesPage />} />
                  
                  {/* Use OptimizedAppRoutes for main app navigation */}
                  <Route path="/*" element={<OptimizedAppRoutes />} />
                </Route>
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  {adminRoutes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                  ))}
                </Route>
                
                {/* Not Found Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </SessionProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
