
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSimpleHelp } from '@/contexts/SimpleHelpContext';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const HelpFloatingButton: React.FC = () => {
  const { openHelp } = useSimpleHelp();

  const handleClick = () => {
    openHelp();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            size="icon"
          >
            <HelpCircle className="h-6 w-6 text-primary-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-sm">
            Get help and watch tutorials
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
