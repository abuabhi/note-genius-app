
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { UserSection } from '@/components/ui/sidebar/UserSection';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';

interface DesktopAuthSectionProps {
  isPublicRoute: boolean;
}

export const DesktopAuthSection = ({ isPublicRoute }: DesktopAuthSectionProps) => {
  const { user } = useAuth();

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
      
      {/* Reminder Bell Icon */}
      <ReminderNavPopover />
      
      {/* User Profile Section */}
      <UserSection isCollapsed={false} />
    </div>
  );
};
