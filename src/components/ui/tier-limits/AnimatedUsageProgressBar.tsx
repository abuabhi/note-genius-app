import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedUsageProgressBarProps {
  used: number;
  limit: number;
  feature: string;
  className?: string;
}

export const AnimatedUsageProgressBar: React.FC<AnimatedUsageProgressBarProps> = ({
  used,
  limit,
  feature,
  className
}) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(limit - used, 0);
  
  const getProgressColor = () => {
    if (percentage >= 95) return 'bg-destructive';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const getProgressGradient = () => {
    if (percentage >= 95) return 'from-red-400 to-red-600';
    if (percentage >= 80) return 'from-orange-400 to-orange-600';
    if (percentage >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-primary to-primary/80';
  };

  const getIcon = () => {
    if (percentage >= 95) return <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />;
    if (percentage >= 80) return <Zap className="h-4 w-4 text-orange-500 animate-pulse" />;
    return <Crown className="h-4 w-4 text-primary" />;
  };

  const getStatusText = () => {
    if (percentage >= 100) return 'Limit reached!';
    if (percentage >= 95) return 'Critical - Almost full!';
    if (percentage >= 80) return 'Warning - Nearly full';
    return `${remaining} remaining`;
  };

  return (
    <div className={cn("space-y-3 p-4 rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-sm">{feature}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{used}/{limit}</span>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            percentage >= 95 ? "bg-destructive/10 text-destructive" :
            percentage >= 80 ? "bg-orange-100 text-orange-700" :
            percentage >= 60 ? "bg-yellow-100 text-yellow-700" :
            "bg-primary/10 text-primary"
          )}>
            {getStatusText()}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-out rounded-full",
              "bg-gradient-to-r", getProgressGradient(),
              percentage >= 80 && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Animated warning overlay for critical usage */}
        {percentage >= 95 && (
          <div className="absolute inset-0 rounded-full">
            <div className="h-full w-full rounded-full bg-destructive/20 animate-ping" />
          </div>
        )}
      </div>

      {/* Percentage indicator */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span className={cn(
          "font-medium",
          percentage >= 95 ? "text-destructive" :
          percentage >= 80 ? "text-orange-600" :
          "text-foreground"
        )}>
          {percentage.toFixed(1)}%
        </span>
        <span>100%</span>
      </div>
    </div>
  );
};