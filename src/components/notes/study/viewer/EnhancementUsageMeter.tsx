
import React, { useCallback } from 'react';
import { Sparkles } from "lucide-react";
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
  // Render usage meter
  const renderUsageMeter = useCallback(() => {
    if (statsLoading) return null;
    
    if (monthlyLimit === null) {
      return (
        <div className="flex items-center text-xs text-mint-700 mb-2 gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Unlimited enhancements</span>
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
      </div>
    );
  }, [currentUsage, monthlyLimit, statsLoading]);

  return renderUsageMeter();
};
