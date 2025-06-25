
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';
import { publicRoutes } from '@/routes/publicRoutes';

// Import optimized routes
import { OptimizedAppRoutes } from '@/components/optimized/OptimizedAppRoutes';

// Keep existing routes for non-optimized pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes from publicRoutes.tsx */}
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
      
      {/* Additional public routes that aren't in publicRoutes.tsx */}
      <Route path="/login" element={
        <LazyLoadWrapper>
          <LoginPage />
        </LazyLoadWrapper>
      } />
      <Route path="/signup" element={
        <LazyLoadWrapper>
          <SignupPage />
        </LazyLoadWrapper>
      } />
      
      {/* Optimized application routes - all features now available */}
      <Route path="/*" element={<OptimizedAppRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
