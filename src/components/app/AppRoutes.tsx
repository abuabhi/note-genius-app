import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';

// Import optimized routes
import { OptimizedAppRoutes } from '@/components/optimized/OptimizedAppRoutes';

// Keep existing routes for non-optimized pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <LazyLoadWrapper>
          <HomePage />
        </LazyLoadWrapper>
      } />
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
      
      {/* Optimized application routes */}
      <Route path="/*" element={<OptimizedAppRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
