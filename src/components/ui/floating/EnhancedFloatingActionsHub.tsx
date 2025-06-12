
import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageCircle, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHelp } from '@/contexts/HelpContext';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EnhancedFloatingActionsHubProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  hasUnreadChat?: boolean;
}

export const EnhancedFloatingActionsHub = ({
  onChatToggle,
  isChatOpen = false,
  hasUnreadChat = false
}: EnhancedFloatingActionsHubProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Add safety check for help context
  let helpContext;
  try {
    helpContext = useHelp();
  } catch (error) {
    console.warn('Help context not available:', error);
    helpContext = null;
  }

  // Define which routes are public - don't show hub on these
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Don't show the hub on public routes or if user is not authenticated
  if (isPublicRoute || !user) {
    return null;
  }

  // Auto-collapse when route changes
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  const handleHelpClick = () => {
    if (helpContext?.openHelp) {
      try {
        helpContext.openHelp();
        setIsExpanded(false);
      } catch (error) {
        console.error('Error opening help:', error);
      }
    }
  };

  const handleChatClick = () => {
    if (onChatToggle) {
      onChatToggle();
      setIsExpanded(false);
    }
  };

  const handleSettingsClick = () => {
    window.location.href = '/settings';
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Actions */}
      <div 
        className={cn(
          "flex flex-col gap-3 mb-3 transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-75 pointer-events-none"
        )}
      >
        {/* Help Button */}
        {helpContext && (
          <Button
            size="lg"
            onClick={handleHelpClick}
            className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 group"
            aria-label="Get Help"
          >
            <HelpCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </Button>
        )}

        {/* Chat Button - only show if chat toggle is available */}
        {onChatToggle && (
          <Button
            size="lg"
            onClick={handleChatClick}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group relative",
              isChatOpen 
                ? "bg-orange-500 hover:bg-orange-600" 
                : "bg-purple-500 hover:bg-purple-600"
            )}
            aria-label={isChatOpen ? "Close Chat" : "Open Chat"}
          >
            <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            {hasUnreadChat && !isChatOpen && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
        )}

        {/* Settings Button */}
        <Button
          size="lg"
          onClick={handleSettingsClick}
          className="h-14 w-14 rounded-full bg-gray-500 hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 group"
          aria-label="Settings"
        >
          <Settings className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Main Toggle Button */}
      <Button
        size="lg"
        onClick={toggleExpanded}
        className="h-16 w-16 rounded-full bg-mint-500 hover:bg-mint-600 shadow-lg hover:shadow-xl transition-all duration-200 group"
        aria-label={isExpanded ? "Close Actions" : "Open Actions"}
      >
        {isExpanded ? (
          <X className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
        ) : (
          <Menu className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
        )}
      </Button>
    </div>
  );
};
