
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { useGlobalSessionTracker } from '@/hooks/useGlobalSessionTracker';
import { Clock, MessageCircle, HelpCircle, Compass, Play, Pause, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Optional hook imports to handle cases where providers aren't available
let useHelp: any = null;
let useGuide: any = null;

try {
  const helpModule = require('@/contexts/HelpContext');
  useHelp = helpModule.useHelp;
} catch (error) {
  console.warn('HelpContext not available in FloatingActionsHub');
}

try {
  const guideModule = require('@/contexts/GuideContext');
  useGuide = guideModule.useGuide;
} catch (error) {
  console.warn('GuideContext not available in FloatingActionsHub');
}

interface FloatingActionsHubProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  hasUnreadChat?: boolean;
  showChat?: boolean;
}

export const FloatingActionsHub = ({ 
  onChatToggle, 
  isChatOpen = false, 
  hasUnreadChat = false,
  showChat = false 
}: FloatingActionsHubProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const {
    isActive: isSessionActive,
    elapsedSeconds,
    isPaused,
    togglePause,
    endSession
  } = useGlobalSessionTracker();

  // Safely use help context if available
  const helpContext = useHelp ? (() => {
    try {
      return useHelp();
    } catch (error) {
      console.warn('Help context not available:', error);
      return null;
    }
  })() : null;

  // Safely use guide context if available
  const guideContext = useGuide ? (() => {
    try {
      return useGuide();
    } catch (error) {
      console.warn('Guide context not available:', error);
      return null;
    }
  })() : null;

  // Don't show for unauthenticated users
  if (!user) return null;

  // Hide during active guides
  if (guideContext?.isActive) return null;

  const contextualHelp = helpContext?.getContextualHelp?.() || [];
  const hasContextualHelp = contextualHelp.length > 0;
  const availableGuides = guideContext?.getAvailableGuides?.() || [];
  const uncompletedGuides = availableGuides.filter(guide => 
    guideContext?.isGuideCompleted ? !guideContext.isGuideCompleted(guide.id) : true
  );

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHelpClick = () => {
    if (helpContext?.openHelp) {
      if (hasContextualHelp) {
        helpContext.openHelp(contextualHelp[0]);
      } else {
        helpContext.openHelp();
      }
    }
  };

  const handleGuideClick = () => {
    if (guideContext?.startGuide && availableGuides.length > 0) {
      guideContext.startGuide(availableGuides[0].id);
    }
  };

  const handleEndSession = () => {
    endSession();
  };

  // Determine which actions to show
  const actions = [];

  // Session Timer (highest priority - always visible when active)
  if (isSessionActive) {
    actions.push({
      id: 'timer',
      component: (
        <div className="flex items-center gap-2 px-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-mint-600" />
            <span className="text-sm font-mono font-medium text-mint-700">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePause}
                    className="h-7 w-7 p-0 hover:bg-mint-100"
                  >
                    {isPaused ? (
                      <Play className="h-3 w-3 text-mint-600" />
                    ) : (
                      <Pause className="h-3 w-3 text-mint-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPaused ? 'Resume' : 'Pause'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEndSession}
                    className="h-7 w-7 p-0 hover:bg-red-100"
                  >
                    <Square className="h-3 w-3 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  End Session
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ),
      priority: 1
    });
  }

  // Chat Button (show on specific pages)
  if (showChat && onChatToggle) {
    actions.push({
      id: 'chat',
      component: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onChatToggle}
                className="h-10 w-10 rounded-full hover:bg-mint-100 relative"
              >
                <MessageCircle className="h-5 w-5 text-mint-600" />
                {hasUnreadChat && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isChatOpen ? 'Close Chat' : 'Open AI Chat'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      priority: 2
    });
  }

  // Help Button (only show if help context is available)
  if (helpContext) {
    actions.push({
      id: 'help',
      component: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpClick}
                className={cn(
                  "h-10 w-10 rounded-full hover:bg-blue-100",
                  hasContextualHelp && "animate-pulse bg-mint-50"
                )}
              >
                <HelpCircle className={cn(
                  "h-5 w-5",
                  hasContextualHelp ? "text-mint-600" : "text-blue-600"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasContextualHelp 
                ? `Get help with ${contextualHelp[0]?.title?.toLowerCase() || 'current page'}` 
                : 'Get help and tutorials'
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      priority: 3
    });
  }

  // Guide Button (only if guides available and guide context exists)
  if (guideContext && availableGuides.length > 0) {
    actions.push({
      id: 'guide',
      component: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGuideClick}
                className="h-10 w-10 rounded-full hover:bg-purple-100 relative"
              >
                <Compass className="h-5 w-5 text-purple-600" />
                {uncompletedGuides.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {uncompletedGuides.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Start interactive guide
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      priority: 4
    });
  }

  // Don't render if no actions
  if (actions.length === 0) return null;

  // Sort by priority
  const sortedActions = actions.sort((a, b) => a.priority - b.priority);

  if (isMinimized && sortedActions.length > 0) {
    return (
      <Card 
        className="fixed bottom-6 right-6 z-50 p-2 shadow-lg cursor-pointer bg-white/95 backdrop-blur-sm border-mint-200 hover:shadow-xl transition-all duration-200"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-1">
          {/* Show only the most important icon when minimized */}
          {sortedActions[0].id === 'timer' && <Clock className="h-4 w-4 text-mint-600" />}
          {sortedActions[0].id === 'chat' && <MessageCircle className="h-4 w-4 text-mint-600" />}
          {sortedActions[0].id === 'help' && <HelpCircle className="h-4 w-4 text-blue-600" />}
          {sortedActions[0].id === 'guide' && <Compass className="h-4 w-4 text-purple-600" />}
          <span className="text-xs text-gray-500">{sortedActions.length}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 shadow-lg bg-white/95 backdrop-blur-sm border-mint-200 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center gap-1 p-2">
        {sortedActions.map((action, index) => (
          <div key={action.id} className={cn(
            index > 0 && "border-l border-mint-100 pl-2"
          )}>
            {action.component}
          </div>
        ))}
        
        {sortedActions.length > 1 && (
          <div className="border-l border-mint-100 pl-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Minimize
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </Card>
  );
};
