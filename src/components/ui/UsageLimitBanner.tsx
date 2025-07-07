import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowUp } from 'lucide-react';
import { UserTier } from '@/hooks/useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AnimatedUsageProgressBar } from './tier-limits/AnimatedUsageProgressBar';
import { FullScreenUpgradeModal } from './tier-limits/FullScreenUpgradeModal';
import { ContextualUpgradeNotification } from './tier-limits/ContextualUpgradeNotification';

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
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
    <>
      {/* Enhanced animated progress bar */}
      <AnimatedUsageProgressBar
        used={usedCount}
        limit={limit}
        feature={feature}
        className={className}
      />

      {/* Full-screen modal for critical limits */}
      <FullScreenUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        blockedFeature={feature}
        usedCount={usedCount}
        limit={limit}
      />

      {/* Contextual notification */}
      <ContextualUpgradeNotification
        isVisible={showNotification}
        onDismiss={() => setShowNotification(false)}
        currentTier={currentTier}
        trigger={isAtLimit ? 'feature-blocked' : 'limit-approaching'}
        feature={feature}
        usagePercentage={usagePercentage}
      />

      {/* Fallback legacy alert for edge cases */}
      {isNearLimit && (
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
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNotification(true)}
                className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Learn More
              </Button>
              <Button
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <ArrowUp className="h-3 w-3 mr-1" />
                Upgrade to {upgradeInfo.name}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};