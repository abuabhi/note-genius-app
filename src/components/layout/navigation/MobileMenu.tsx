
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';

interface MobileMenuProps {
  isOpen: boolean;
  isPublicRoute: boolean;
}

export const MobileMenu = ({ isOpen, isPublicRoute }: MobileMenuProps) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="px-6 py-4 space-y-4">
        {!user ? (
          <>
            <Link 
              to="/login" 
              className="block text-mint-700 hover:text-mint-900 font-medium py-2"
            >
              Login
            </Link>
            <Button asChild className="w-full bg-mint-500 hover:bg-mint-600 text-white">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </>
        ) : (
          <>
            {/* Public Routes Navigation for Authenticated Users */}
            {isPublicRoute && (
              <Link 
                to="/dashboard" 
                className="block text-mint-700 hover:text-mint-900 font-medium py-2"
              >
                Dashboard
              </Link>
            )}
            
            {/* Reminder Bell for Mobile */}
            <div className="flex items-center justify-start py-2">
              <span className="text-sm font-medium text-gray-700 mr-3">Reminders:</span>
              <ReminderNavPopover />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
