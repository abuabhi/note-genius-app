
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import { publicRoutes } from '@/routes/publicRoutes';
import { standardRoutes } from '@/routes/standardRoutes';
import { adminRoutes } from '@/routes/adminRoutes';
import { authCallbackRoutes } from '@/routes/authCallbackRoutes';
import { miscRoutes } from '@/routes/miscRoutes';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/auth';

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  console.log('🚦 [APP ROUTES] Auth state:', { userId: user?.id, loading });

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600"></div>
        </div>
      );
    }
    return user ? <>{children}</> : <Navigate to="/login" />;
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600"></div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Routes>
      {/* Public routes - accessible without authentication */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <LazyLoadWrapper>
              {route.element}
            </LazyLoadWrapper>
          }
        />
      ))}
      
      {/* Login route - redirect to dashboard if already authenticated */}
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} 
      />
      
      {/* Auth callback routes */}
      {authCallbackRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <LazyLoadWrapper>
              {route.element}
            </LazyLoadWrapper>
          }
        />
      ))}
      
      {/* Protected standard routes */}
      {standardRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSkeleton />}>
                <LazyLoadWrapper>
                  {route.element}
                </LazyLoadWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
      ))}
      
      {/* Protected admin routes */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSkeleton />}>
                <LazyLoadWrapper>
                  {route.element}
                </LazyLoadWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
      ))}
      
      {/* Misc routes */}
      {miscRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.path === "*" ? route.element : (
              <ProtectedRoute>
                <Suspense fallback={<LoadingSkeleton />}>
                  <LazyLoadWrapper>
                    {route.element}
                  </LazyLoadWrapper>
                </Suspense>
              </ProtectedRoute>
            )
          }
        />
      ))}
    </Routes>
  );
};

export default AppRoutes;
