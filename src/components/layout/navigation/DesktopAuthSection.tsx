
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
      <div className="hidden md:flex items-center space-x-3">
        <Link 
          to="/login" 
          className="text-gray-600 hover:text-mint-700 font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-mint-50"
        >
          Login
        </Link>
        <Button 
          asChild 
          className="bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-3">
      {/* Public Navigation Links - Desktop - Only on public routes when authenticated */}
      {isPublicRoute && (
        <Link 
          to="/dashboard" 
          className="text-gray-600 hover:text-mint-700 font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-mint-50"
        >
          Dashboard
        </Link>
      )}
      
      {/* Action buttons with subtle styling */}
      <div className="flex items-center space-x-2 bg-gray-50/60 rounded-full px-3 py-1 backdrop-blur-sm border border-gray-200/50">
        {/* Reminder Bell Icon */}
        <ReminderNavPopover />
      </div>
      
      {/* User Profile Section */}
      <UserSection isCollapsed={false} />
    </div>
  );
};
