
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGuide } from '@/contexts/GuideContext';
import { Compass, BookOpen } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const GuideFloatingButton: React.FC = () => {
  const { 
    startGuide, 
    getAvailableGuides, 
    isGuideCompleted, 
    isActive 
  } = useGuide();

  const availableGuides = getAvailableGuides();
  const uncompletedGuides = availableGuides.filter(guide => !isGuideCompleted(guide.id));

  if (isActive) {
    return null; // Hide button when guide is active
  }

  const handleStartGuide = (guideId: string) => {
    startGuide(guideId);
  };

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="w-14 h-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105"
            size="icon"
          >
            <div className="relative">
              <Compass className="h-6 w-6" />
              {uncompletedGuides.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {uncompletedGuides.length}
                </Badge>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent side="left" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Available Guides
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {availableGuides.length === 0 ? (
            <DropdownMenuItem disabled>
              No guides available for this page
            </DropdownMenuItem>
          ) : (
            availableGuides.map((guide) => (
              <DropdownMenuItem
                key={guide.id}
                onClick={() => handleStartGuide(guide.id)}
                className="cursor-pointer"
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{guide.title}</span>
                    {isGuideCompleted(guide.id) && (
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{guide.description}</span>
                  <span className="text-xs text-gray-400">{guide.estimatedDuration}m</span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
