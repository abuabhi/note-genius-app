
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { useGlobalSessionTracker } from '@/hooks/useGlobalSessionTracker';
import { Clock, MessageCircle, HelpCircle, Compass, Play, Pause, Square, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHelp } from '@/contexts/HelpContext';
import { useGuide } from '@/contexts/GuideContext';

interface EnhancedFloatingActionsHubProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  hasUnreadChat?: boolean;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = 'floating-dock-position';
const DEFAULT_POSITION = { x: 50, y: 90 }; // Bottom center as percentage

export const EnhancedFloatingActionsHub = ({ 
  onChatToggle, 
  isChatOpen = false, 
  hasUnreadChat = false
}: EnhancedFloatingActionsHubProps) => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL LOGIC BEFORE THIS POINT
  const { user } = useAuth();
  const location = useLocation();
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dockRef = useRef<HTMLDivElement>(null);
  
  const {
    isActive: isSessionActive,
    elapsedSeconds,
    isPaused,
    togglePause,
    endSession,
    isOnStudyPage
  } = useGlobalSessionTracker();

  // Always call these hooks - they're now properly available due to provider setup
  const helpContext = useHelp();
  const guideContext = useGuide();

  // Debug logging for chat functionality
  useEffect(() => {
    console.log('EnhancedFloatingActionsHub state:', {
      location: location.pathname,
      onChatToggle: !!onChatToggle,
      isChatOpen,
      isNoteStudyPage: location.pathname.includes('/notes/study/')
    });
  }, [location.pathname, onChatToggle, isChatOpen]);

  // Load position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem(STORAGE_KEY);
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (error) {
        console.warn('Failed to parse saved position:', error);
      }
    }
  }, []);

  // Save position to localStorage
  const savePosition = useCallback((newPosition: Position) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dockRef.current) return;
    
    const rect = dockRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = ((e.clientX - dragOffset.x) / window.innerWidth) * 100;
      const newY = ((e.clientY - dragOffset.y) / window.innerHeight) * 100;
      
      // Constrain to viewport bounds
      const constrainedX = Math.max(0, Math.min(100, newX));
      const constrainedY = Math.max(0, Math.min(100, newY));
      
      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        savePosition(position);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position, savePosition]);

  // Action handlers
  const handleHelpClick = useCallback(() => {
    console.log('Help button clicked, helpContext:', helpContext);
    if (helpContext && typeof helpContext.openHelp === 'function') {
      console.log('Opening help dialog');
      helpContext.openHelp();
    } else {
      console.warn('Help context or openHelp method not available');
    }
  }, [helpContext]);

  const handleGuideClick = useCallback(() => {
    console.log('Guide button clicked, guideContext:', guideContext);
    if (guideContext && typeof guideContext.startGuide === 'function' && typeof guideContext.getAvailableGuides === 'function') {
      const guides = guideContext.getAvailableGuides();
      console.log('Available guides:', guides);
      if (guides.length > 0) {
        console.log('Starting guide:', guides[0].id);
        guideContext.startGuide(guides[0].id);
      } else {
        console.log('No guides available for current page');
      }
    } else {
      console.warn('Guide context or methods not available');
    }
  }, [guideContext]);

  const handleEndSession = useCallback(() => {
    endSession();
  }, [endSession]);

  // NOW WE CAN DO CONDITIONAL LOGIC AFTER ALL HOOKS ARE CALLED
  
  // Don't show for unauthenticated users
  if (!user) return null;

  // Define which routes are public - don't show dock on these
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Don't show on public routes
  if (isPublicRoute) return null;

  // IMPROVED: Only hide during active guides when guide is actually displaying tooltips
  // Check if guide is both active AND has successfully found its target
  const shouldHideForGuide = guideContext?.isActive && guideContext?.currentGuide && guideContext?.currentStepIndex >= 0;
  if (shouldHideForGuide) return null;

  // Determine page context
  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('/notes/study/')) return 'note-study';
    if (path.startsWith('/notes')) return 'notes';
    if (path.startsWith('/flashcards')) return 'flashcards';
    if (path.startsWith('/quiz')) return 'quiz';
    return 'other';
  };

  const pageContext = getPageContext();
  
  // FIXED: Chat should show on note study pages when onChatToggle is provided
  const showChat = pageContext === 'note-study' && typeof onChatToggle === 'function';
  
  console.log('Chat visibility logic:', { pageContext, onChatToggle: !!onChatToggle, showChat });

  // Session timer state
  const getSessionState = () => {
    if (isSessionActive && isOnStudyPage && !isPaused) return 'active';
    if (isSessionActive) return 'inactive';
    return 'none';
  };

  const sessionState = getSessionState();

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer section styles based on session state
  const getTimerStyles = () => {
    switch (sessionState) {
      case 'active':
        return {
          bg: 'bg-red-500/20 border-red-500/30',
          text: 'text-red-700',
          icon: 'text-red-600'
        };
      case 'inactive':
        return {
          bg: 'bg-gray-500/20 border-gray-500/30',
          text: 'text-gray-600',
          icon: 'text-gray-500'
        };
      default:
        return {
          bg: 'bg-transparent border-transparent',
          text: 'text-gray-500',
          icon: 'text-gray-400'
        };
    }
  };

  const timerStyles = getTimerStyles();

  return (
    <TooltipProvider>
      <Card 
        ref={dockRef}
        className={cn(
          "fixed z-50 shadow-lg transition-all duration-200 backdrop-blur-sm cursor-move select-none",
          "bg-white/95 border-gray-200/50",
          isDragging ? "scale-105 shadow-xl" : "hover:shadow-xl"
        )}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1 p-2">
          {/* Drag Handle */}
          <div className="flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing">
            <GripHorizontal className="h-3 w-3 text-gray-400" />
          </div>

          {/* Session Timer - Show if session exists */}
          {sessionState !== 'none' && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <div className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
                timerStyles.bg
              )}>
                <Clock className={cn("h-4 w-4", timerStyles.icon)} />
                <span className={cn("text-sm font-mono font-medium", timerStyles.text)}>
                  {formatTime(elapsedSeconds)}
                </span>
                
                {/* Timer Controls - Only show when active */}
                {sessionState === 'active' && (
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePause();
                          }}
                          className="h-6 w-6 p-0 hover:bg-white/20"
                        >
                          {isPaused ? (
                            <Play className="h-3 w-3 text-inherit" />
                          ) : (
                            <Pause className="h-3 w-3 text-inherit" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isPaused ? 'Resume' : 'Pause'}
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEndSession();
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-200/50"
                        >
                          <Square className="h-3 w-3 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        End Session
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Chat Button - Show on note study pages when onChatToggle is available */}
          {showChat && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Chat button clicked, calling onChatToggle');
                      onChatToggle();
                    }}
                    className="h-8 w-8 rounded-full hover:bg-mint-100/50 relative"
                  >
                    <MessageCircle className="h-4 w-4 text-mint-600" />
                    {hasUnreadChat && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isChatOpen ? 'Close Chat' : 'Open AI Chat'}
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Help Button - Available on all authenticated pages */}
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleHelpClick();
                }}
                className="h-8 w-8 rounded-full hover:bg-blue-100/50"
              >
                <HelpCircle className="h-4 w-4 text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Get help and tutorials
            </TooltipContent>
          </Tooltip>

          {/* Guide Button - Available on all authenticated pages */}
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGuideClick();
                }}
                className="h-8 w-8 rounded-full hover:bg-purple-100/50"
              >
                <Compass className="h-4 w-4 text-purple-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Start interactive guide
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </TooltipProvider>
  );
};
