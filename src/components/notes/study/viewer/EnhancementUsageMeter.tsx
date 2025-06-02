
import React, { useCallback } from 'react';
import { Sparkles, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  // FIXED: Render usage meter with better error handling and display
  const renderUsageMeter = useCallback(() => {
    console.log("🔍 EnhancementUsageMeter - Rendering with:", {
      statsLoading,
      currentUsage,
      monthlyLimit,
      hasLimit: monthlyLimit !== null
    });

    if (statsLoading) {
      return (
        <div className="mb-2 space-y-1">
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-mint-600 animate-pulse" />
              <span className="text-mint-700">Loading usage...</span>
            </div>
            <div className="h-4 w-12 bg-gray-100 animate-pulse rounded"></div>
          </div>
          <Progress value={30} className="h-1 bg-gray-100" />
        </div>
      );
    }
    
    if (monthlyLimit === null) {
      // Show unlimited status
      return (
        <div className="mb-2 space-y-1">
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-mint-600" />
              <span className="text-mint-700">AI Usage: Unlimited</span>
            </div>
            <span className="text-mint-700 font-medium">∞</span>
          </div>
          <Progress value={100} className="h-1 bg-mint-100" />
        </div>
      );
    }
    
    const percentage = Math.min(Math.round((currentUsage / monthlyLimit) * 100), 100);
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;
    
    return (
      <div className="mb-2 space-y-1">
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-mint-600" />
            <span className="text-mint-700">AI Usage</span>
            {isAtLimit && <AlertCircle className="w-3 h-3 text-red-500" />}
          </div>
          <span className={`font-medium ${
            isAtLimit ? 'text-red-600' : 
            isNearLimit ? 'text-amber-600' : 
            'text-mint-700'
          }`}>
            {currentUsage}/{monthlyLimit}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className={`h-1 ${
            isAtLimit ? 'bg-red-100' : 
            isNearLimit ? 'bg-amber-100' : 
            'bg-mint-100'
          }`} 
        />
        {isNearLimit && (
          <p className={`text-xs mt-1 ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`}>
            {isAtLimit 
              ? "Monthly limit reached. Upgrade for more enhancements." 
              : "Approaching monthly limit."}
          </p>
        )}
      </div>
    );
  }, [currentUsage, monthlyLimit, statsLoading]);

  return renderUsageMeter();
};
