
import React from 'react';
import { Button } from '@/components/ui/button';
import { useHelp } from '@/contexts/HelpContext';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const HelpFloatingButton: React.FC = () => {
  const { openHelp, getContextualHelp } = useHelp();

  const contextualHelp = getContextualHelp();
  const hasContextualHelp = contextualHelp.length > 0;

  const handleClick = () => {
    if (hasContextualHelp) {
      openHelp(contextualHelp[0]); // Open first contextual help item
    } else {
      openHelp(); // Open general help
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className={`
              fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg 
              ${hasContextualHelp 
                ? 'bg-mint-600 hover:bg-mint-700 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
              }
              transition-all duration-300 hover:scale-105
            `}
            size="icon"
          >
            {hasContextualHelp ? (
              <MessageCircle className="h-6 w-6" />
            ) : (
              <HelpCircle className="h-6 w-6" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-sm">
            {hasContextualHelp 
              ? `Get help with ${contextualHelp[0].title.toLowerCase()}` 
              : 'Get help and watch tutorials'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
