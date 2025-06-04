
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { UserTier } from '@/hooks/useRequireAuth';

interface MobileMenuProps {
  isOpen: boolean;
  isPublicRoute: boolean;
}

export const MobileMenu = ({ isOpen, isPublicRoute }: MobileMenuProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get user tier safely if user is logged in
  const userProfile = user?.user_metadata;
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white border-b shadow-md z-10">
      <div className="container mx-auto p-6 flex flex-col space-y-4">
        {!user ? (
          <>
            {/* Public Navigation Links - Mobile */}
            <Link to="/about" className="text-mint-700 hover:text-mint-900">About</Link>
            <Link to="/blog" className="text-mint-700 hover:text-mint-900">Blog</Link>
            <Link to="/features" className="text-mint-700 hover:text-mint-900">Features</Link>
            <Link to="/pricing" className="text-mint-700 hover:text-mint-900">Pricing</Link>
            <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-100">
              <Link to="/login" className="text-mint-700 hover:text-mint-900 font-medium">Login</Link>
              <Button asChild className="bg-mint-500 hover:bg-mint-600 text-white w-full">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Public Navigation Links - Mobile - Only on public routes when authenticated */}
            {isPublicRoute && (
              <>
                <Link to="/about" className="text-mint-700 hover:text-mint-900">About</Link>
                <Link to="/blog" className="text-mint-700 hover:text-mint-900">Blog</Link>
                <Link to="/features" className="text-mint-700 hover:text-mint-900">Features</Link>
                <Link to="/pricing" className="text-mint-700 hover:text-mint-900">Pricing</Link>
                <Link to="/dashboard" className="text-mint-700 hover:text-mint-900 font-medium">Dashboard</Link>
              </>
            )}
            
            {/* Authenticated Navigation - Mobile - Only on non-public routes */}
            {!isPublicRoute && (
              <>
                <Link to="/settings" className="text-mint-700 hover:text-mint-900">Settings</Link>
                {isAdmin && (
                  <>
                    <div className="font-medium text-sm text-muted-foreground pt-2">Admin</div>
                    <Link to="/admin/users" className="text-mint-700 hover:text-mint-900 pl-2">Users</Link>
                    <Link to="/admin/flashcards" className="text-mint-700 hover:text-mint-900 pl-2">Flashcards</Link>
                    <Link to="/admin/sections" className="text-mint-700 hover:text-mint-900 pl-2">Sections</Link>
                    <Link to="/admin/grades" className="text-mint-700 hover:text-mint-900 pl-2">Grades</Link>
                    <Link to="/admin/csv-import" className="text-mint-700 hover:text-mint-900 pl-2">CSV Import</Link>
                    <Link to="/admin/features" className="text-mint-700 hover:text-mint-900 pl-2">Feature Management</Link>
                  </>
                )}
              </>
            )}
            
            {/* Logout button always visible on mobile when logged in */}
            <Button variant="outline" onClick={handleLogout} className="border-mint-200 hover:bg-mint-50 text-mint-700 mt-2">
              Logout
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
