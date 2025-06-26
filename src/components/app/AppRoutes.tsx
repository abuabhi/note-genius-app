
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import LoginPage from '@/pages/LoginPage';
import { OptimizedAppRoutes } from '@/components/optimized/OptimizedAppRoutes';
import { publicRoutes } from '@/routes/publicRoutes';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';

const AppRoutes = () => {
  const { user } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      {/* Public routes */}
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
      
      {/* Protected routes */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <OptimizedAppRoutes />
          </ProtectedRoute>
        } 
      />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
