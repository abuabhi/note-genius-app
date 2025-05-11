
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserTier } from '@/hooks/useRequireAuth';
import { DndToggle } from '@/components/dnd/DndToggle';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';

interface DesktopAuthSectionProps {
  isPublicRoute: boolean;
}

export const DesktopAuthSection = ({ isPublicRoute }: DesktopAuthSectionProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get user tier safely if user is logged in
  const userProfile = user?.user_metadata;
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // If user is not authenticated
  if (!user) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Link to="/login" className="text-mint-700 hover:text-mint-900 font-medium">Login</Link>
        <Button asChild className="bg-mint-500 hover:bg-mint-600 text-white">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  // If user is authenticated and on public routes
  if (isPublicRoute) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Link to="/dashboard" className="text-mint-700 hover:text-mint-900 font-medium">Dashboard</Link>
        <Button variant="outline" onClick={handleLogout} className="border-mint-200 hover:bg-mint-50 text-mint-700">
          Logout
        </Button>
      </div>
    );
  }

  // If user is authenticated and on non-public routes
  return (
    <div className="hidden md:flex items-center gap-4">
      {/* Admin dropdown only for DEAN tier */}
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/admin/users">Users</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/flashcards">Flashcards</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/sections">Sections</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/grades">Grades</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/csv-import">CSV Import</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/features">Feature Management</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* DND Toggle */}
      <DndToggle />
      
      {/* Reminders popover */}
      <ReminderNavPopover />
    </div>
  );
};
