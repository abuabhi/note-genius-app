
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
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Monthly Usage</span>
        <span>{currentUsage} / {monthlyLimit || '∞'}</span>
      </div>
      {monthlyLimit && (
        <Progress value={(currentUsage / monthlyLimit) * 100} />
      )}
    </div>
  );
};
