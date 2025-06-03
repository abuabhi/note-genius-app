
import React, { useCallback } from 'react';
import { Sparkles, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancementUsageMeterProps {
  statsLoading: boolean;
  currentUsage: number;
  monthlyLimit: number | null;
}

export const EnhancementUsageMeter: React.FC<EnhancementUsageMeterProps> = ({
  statsLoading,
  currentUsage,
  monthlyLimit
}) => {
  // FIXED: Compact usage meter with better space efficiency
  const renderUsageMeter = useCallback(() => {
    console.log("🔍 EnhancementUsageMeter - Rendering compact version with:", {
      statsLoading,
      currentUsage,
      monthlyLimit,
      hasLimit: monthlyLimit !== null
    });

    if (statsLoading) {
      return (
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-mint-600 animate-pulse" />
              <span className="text-xs text-mint-700">AI Usage</span>
            </div>
            <div className="h-3 w-8 bg-gray-100 animate-pulse rounded"></div>
          </div>
        </div>
      );
    }
    
    if (monthlyLimit === null) {
      // Show compact unlimited status
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mb-2 cursor-help">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-mint-600" />
                    <span className="text-xs text-mint-700">AI Usage</span>
                  </div>
                  <span className="text-xs font-medium text-mint-700">Unlimited</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your plan includes unlimited AI enhancements</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    const percentage = Math.min(Math.round((currentUsage / monthlyLimit) * 100), 100);
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;
    
    // Compact format with progress bar only when approaching/at limit
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mb-2 cursor-help">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-mint-600" />
                  <span className="text-xs text-mint-700">AI Usage</span>
                  {isAtLimit && <AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${
                    isAtLimit ? 'text-red-600' : 
                    isNearLimit ? 'text-amber-600' : 
                    'text-mint-700'
                  }`}>
                    {currentUsage}/{monthlyLimit}
                  </span>
                  <span className={`text-xs ${
                    isAtLimit ? 'text-red-600' : 
                    isNearLimit ? 'text-amber-600' : 
                    'text-mint-700'
                  }`}>
                    ({percentage}%)
                  </span>
                </div>
              </div>
              {/* Show progress bar only when approaching or at limit */}
              {isNearLimit && (
                <div className="mt-1">
                  <Progress 
                    value={percentage} 
                    className={`h-1 ${
                      isAtLimit ? 'bg-red-100' : 'bg-amber-100'
                    }`} 
                  />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-medium">AI Enhancement Usage</p>
              <p>Used: {currentUsage} / {monthlyLimit} ({percentage}%)</p>
              {isAtLimit && (
                <p className="text-red-600 mt-1">Monthly limit reached. Upgrade for more enhancements.</p>
              )}
              {isNearLimit && !isAtLimit && (
                <p className="text-amber-600 mt-1">Approaching monthly limit.</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, [currentUsage, monthlyLimit, statsLoading]);

  return renderUsageMeter();
};
