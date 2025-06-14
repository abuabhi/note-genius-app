
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { UserSection } from '@/components/ui/sidebar/UserSection';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';
import { HelpCircle } from 'lucide-react';
import { useHelp } from '@/contexts/HelpContext';

interface DesktopAuthSectionProps {
  isPublicRoute: boolean;
}

export const DesktopAuthSection = ({ isPublicRoute }: DesktopAuthSectionProps) => {
  const { user } = useAuth();
  
  // Safely use help context
  let helpContext = null;
  try {
    helpContext = useHelp();
  } catch (error) {
    console.warn('Help context not available:', error);
  }

  const handleHelpClick = () => {
    if (helpContext?.openHelp) {
      const contextualHelp = helpContext.getContextualHelp?.() || [];
      if (contextualHelp.length > 0) {
        helpContext.openHelp(contextualHelp[0]);
      } else {
        helpContext.openHelp();
      }
    }
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
      
      {/* Reminder Bell Icon */}
      <ReminderNavPopover />
      
      {/* Help Icon - Next to Reminder */}
      {helpContext && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpClick}
          className="h-10 w-10 p-0 hover:bg-mint-100"
          title="Get Help"
        >
          <HelpCircle className="h-5 w-5 text-mint-600" />
        </Button>
      )}
      
      {/* User Profile Section */}
      <UserSection isCollapsed={false} />
    </div>
  );
};
