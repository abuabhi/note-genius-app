
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface UsageIndicatorProps {
  currentUsage: number;
  monthlyLimit: number | null;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  currentUsage,
  monthlyLimit
}) => {
  // If there's no monthly limit, don't show the usage indicator
  if (!monthlyLimit) return null;
  
  const percentage = Math.min(Math.round((currentUsage / monthlyLimit) * 100), 100);
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Enhancement Usage: {currentUsage} / {monthlyLimit}
        </span>
        <span className={`font-medium ${percentage > 80 ? 'text-red-600' : 'text-mint-700'}`}>
          {percentage}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${
          percentage > 80 ? 'bg-red-100' : 'bg-mint-100'
        }`} 
      />
    </div>
  );
};
