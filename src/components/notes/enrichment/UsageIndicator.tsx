import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { CircleHelp, ArrowUpRight } from 'lucide-react';
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
  userTier?: string | null;
}

const NEXT_TIER: Record<string, string> = {
  SCHOLAR: 'GRADUATE',
  GRADUATE: 'MASTER',
  MASTER: 'DEAN',
};

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  currentUsage,
  monthlyLimit,
  isLoading = false,
  userTier = null,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Enhancement Usage</span>
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
          <span className="text-muted-foreground">Enhancement Usage: Unlimited</span>
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
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isAtLimit = percentage >= 100;
  const nextTier = userTier ? NEXT_TIER[userTier] : null;
  const upgradeHref = `/pricing${nextTier ? `?from=${userTier}&to=${nextTier}#${nextTier.toLowerCase()}` : ''}`;

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
      {(isNearLimit || isAtLimit) && (
        <div className={`flex items-center justify-between gap-2 text-xs ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`}>
          <p>
            {isAtLimit
              ? "You've reached your monthly limit. Upgrade your plan for more enrichments."
              : "You're approaching your monthly limit. Plan your enrichments carefully."}
          </p>
          <Link
            to={upgradeHref}
            className={`inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline whitespace-nowrap ${
              isAtLimit ? 'text-red-700' : 'text-amber-700'
            }`}
          >
            {nextTier ? `Upgrade to ${nextTier}` : 'Upgrade'}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
};
