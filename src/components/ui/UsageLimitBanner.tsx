import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowUp } from 'lucide-react';
import { UserTier } from '@/hooks/useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface UsageLimitBannerProps {
  currentTier: UserTier;
  feature: string;
  usedCount: number;
  limit: number;
  className?: string;
}

export const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({
  currentTier,
  feature,
  usedCount,
  limit,
  className = ''
}) => {
  const { createCheckoutSession } = useSubscription();
  
  const usagePercentage = Math.round((usedCount / limit) * 100);
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usedCount >= limit;

  const getUpgradeInfo = () => {
    if (currentTier === UserTier.SCHOLAR) {
      return { tier: 'GRADUATE' as const, name: 'Graduate', price: '$9.99/mo' };
    } else if (currentTier === UserTier.GRADUATE) {
      return { tier: 'MASTER' as const, name: 'Master', price: '$19.99/mo' };
    }
    return null;
  };

  const upgradeInfo = getUpgradeInfo();

  const handleUpgrade = async () => {
    if (upgradeInfo) {
      try {
        await createCheckoutSession(upgradeInfo.tier, 'monthly');
      } catch (error) {
        console.error('Error upgrading:', error);
      }
    }
  };

  if (!isNearLimit || currentTier === UserTier.DEAN || !upgradeInfo) {
    return null;
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="text-amber-800 font-medium">
            {isAtLimit ? `${feature} limit reached` : `${feature} limit warning`}
          </span>
          <span className="text-amber-700 text-sm block">
            {isAtLimit 
              ? `You've used all ${limit} ${feature.toLowerCase()}. Upgrade to continue.`
              : `You've used ${usedCount}/${limit} ${feature.toLowerCase()} (${usagePercentage}%). Consider upgrading.`
            }
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleUpgrade}
          className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100 ml-4"
        >
          <ArrowUp className="h-3 w-3 mr-1" />
          Upgrade to {upgradeInfo.name}
        </Button>
      </AlertDescription>
    </Alert>
  );
};