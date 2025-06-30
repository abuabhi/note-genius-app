
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/auth';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { ScalableReminderPopover } from '@/components/reminders/ScalableReminderPopover';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-mint-600 to-blue-600 bg-clip-text text-transparent">
                PrepGenie
              </div>
            </Link>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Scalable Reminder System */}
                <ScalableReminderPopover />
                
                {/* Notification Panel */}
                <NotificationPanel />
                
                {/* User Menu */}
                <UserMenu />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="bg-mint-600 hover:bg-mint-700 text-white"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
