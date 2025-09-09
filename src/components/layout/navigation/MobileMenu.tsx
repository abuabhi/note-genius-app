
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
    <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/60 shadow-lg z-50">
      <div className="px-6 py-6 space-y-4">
        {!user ? (
          <div className="space-y-3">
            {/* Public Navigation for Non-Authenticated Users */}
            <div className="space-y-1 border-b border-gray-200 pb-3 mb-3">
              <Link 
                to="/features" 
                className="block text-gray-600 hover:text-mint-700 font-medium py-2 px-4 rounded-lg hover:bg-mint-50 transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="block text-gray-600 hover:text-mint-700 font-medium py-2 px-4 rounded-lg hover:bg-mint-50 transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/blog" 
                className="block text-gray-600 hover:text-mint-700 font-medium py-2 px-4 rounded-lg hover:bg-mint-50 transition-colors"
              >
                Blog
              </Link>
              <Link 
                to="/about" 
                className="block text-gray-600 hover:text-mint-700 font-medium py-2 px-4 rounded-lg hover:bg-mint-50 transition-colors"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block text-gray-600 hover:text-mint-700 font-medium py-2 px-4 rounded-lg hover:bg-mint-50 transition-colors"
              >
                Contact
              </Link>
            </div>
            <Link 
              to="/login" 
              className="block text-gray-600 hover:text-mint-700 font-medium py-3 px-4 rounded-lg hover:bg-mint-50 transition-colors"
            >
              Login
            </Link>
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white shadow-sm"
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Public Routes Navigation for Authenticated Users */}
            {isPublicRoute && (
              <>
                <Link 
                  to="/blog" 
                  className="block text-gray-600 hover:text-mint-700 font-medium py-2 px-4 rounded-lg hover:bg-mint-50 transition-colors"
                >
                  Blog
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block text-gray-600 hover:text-mint-700 font-medium py-3 px-4 rounded-lg hover:bg-mint-50 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}
            
            {/* Reminder Bell for Mobile */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Reminders</span>
              <ReminderNavPopover />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
