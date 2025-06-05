
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { UserTier } from '@/hooks/useRequireAuth';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';
import { useReminderToasts } from '@/hooks/useReminderToasts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, User } from 'lucide-react';

interface DesktopAuthSectionProps {
  isPublicRoute: boolean;
}

export const DesktopAuthSection = ({ isPublicRoute }: DesktopAuthSectionProps) => {
  const { user, signOut } = useAuth();
  
  // Initialize reminder toasts
  useReminderToasts();
  
  // Get user tier safely if user is logged in
  const userProfile = user?.user_metadata;
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  
  const handleLogout = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Link to="/login" className="text-mint-700 hover:text-mint-900 font-medium">
          Login
        </Link>
        <Button asChild className="bg-mint-500 hover:bg-mint-600 text-white">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      {/* Public Navigation Links - Desktop - Only on public routes when authenticated */}
      {isPublicRoute && (
        <Link to="/dashboard" className="text-mint-700 hover:text-mint-900 font-medium">
          Dashboard
        </Link>
      )}
      
      {/* Reminder bell - Only on non-public routes */}
      {!isPublicRoute && <ReminderNavPopover />}
      
      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.email}</p>
              {userProfile?.user_tier && (
                <p className="w-[200px] truncate text-xs text-muted-foreground">
                  {userProfile.user_tier}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="w-full cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/users" className="w-full cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
