
import React, { useCallback } from 'react';
import { Sparkles, AlertCircle } from "lucide-react";
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
  const renderUsageMeter = useCallback(() => {
    console.log("🔍 EnhancementUsageMeter - Rendering circular version with:", {
      statsLoading,
      currentUsage,
      monthlyLimit,
      hasLimit: monthlyLimit !== null
    });

    if (statsLoading) {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-mint-600 animate-pulse" />
            <span className="text-xs text-mint-700">AI Usage</span>
          </div>
          <div className="w-4 h-4 border-2 border-gray-200 border-t-mint-500 rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (monthlyLimit === null) {
      // Show unlimited status with infinity symbol
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 mb-2 cursor-help">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-mint-600" />
                  <span className="text-xs text-mint-700">AI Usage</span>
                </div>
                <div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-mint-600">
                  ∞
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
    
    // Calculate stroke dash array for circular progress
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // Determine colors based on usage
    const strokeColor = isAtLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981';
    const bgColor = isAtLimit ? '#fee2e2' : isNearLimit ? '#fef3c7' : '#ecfdf5';
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 mb-2 cursor-help">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-mint-600" />
                <span className="text-xs text-mint-700">AI Usage</span>
                {isAtLimit && <AlertCircle className="w-3 h-3 text-red-500" />}
              </div>
              
              {/* Circular Progress Indicator */}
              <div className="relative flex items-center justify-center">
                <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 20 20">
                  {/* Background circle */}
                  <circle
                    cx="10"
                    cy="10"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="10"
                    cy="10"
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-in-out"
                  />
                </svg>
                {/* Percentage text inside circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className={`text-[8px] font-bold ${
                      isAtLimit ? 'text-red-600' : 
                      isNearLimit ? 'text-amber-600' : 
                      'text-mint-600'
                    }`}
                  >
                    {percentage}
                  </span>
                </div>
              </div>
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
