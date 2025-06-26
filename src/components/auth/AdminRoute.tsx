
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // For now, allow any authenticated user to access admin routes
  // In a real app, you'd check for admin role here
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
