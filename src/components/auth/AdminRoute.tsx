
import { Navigate, Outlet } from 'react-router-dom';
import { useRequireAuth, UserTier } from '@/hooks/useRequireAuth';
import { Loader2 } from 'lucide-react';

export const AdminRoute = () => {
  const { userProfile, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) return <Navigate to="/login" replace />;
  if (userProfile.user_tier !== UserTier.DEAN) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
