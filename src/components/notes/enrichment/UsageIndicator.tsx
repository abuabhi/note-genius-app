
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CircleHelp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UsageIndicatorProps {
  currentUsage: number;
  monthlyLimit: number | null;
  isLoading?: boolean;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  currentUsage,
  monthlyLimit,
  isLoading = false
}) => {
  // If there's no monthly limit or still loading, show a simplified version
  if (isLoading) {
    return (
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Enhancement Usage
          </span>
          <div className="h-4 w-12 bg-gray-100 animate-pulse rounded"></div>
        </div>
        <Progress value={30} className="h-2 bg-gray-100" />
      </div>
    );
  }
  
  if (monthlyLimit === null) {
    return (
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Enhancement Usage: Unlimited
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your plan includes unlimited note enhancements</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Progress value={100} className="h-2 bg-mint-100" />
      </div>
    );
  }
  
  const percentage = Math.min(Math.round((currentUsage / monthlyLimit) * 100), 100);
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Enhancement Usage: {currentUsage} / {monthlyLimit}
        </span>
        <span className={`font-medium ${
          isAtLimit ? 'text-red-600' : 
          isNearLimit ? 'text-amber-600' : 
          'text-mint-700'
        }`}>
          {percentage}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${
          isAtLimit ? 'bg-red-100' : 
          isNearLimit ? 'bg-amber-100' : 
          'bg-mint-100'
        }`} 
      />
      {isNearLimit && (
        <p className={`text-xs ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`}>
          {isAtLimit 
            ? "You've reached your monthly limit. Consider upgrading your plan for more enhancements." 
            : "You're approaching your monthly limit. Plan your enhancements carefully."}
        </p>
      )}
    </div>
  );
};
