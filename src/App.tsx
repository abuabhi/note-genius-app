import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { QueryClient } from '@tanstack/react-query';
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

// Component to handle study activity detection
const StudyActivityHandler = () => {
  useStudyActivityDetector();
  return null;
};

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <SessionProvider>
            <StudyActivityHandler />
            <Toaster position="top-right" />
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {publicRoutes.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} />
                ))}
                
                {/* Standard User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<OptimizedAppRoutes />} />
                  {standardRoutes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                  ))}
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
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
