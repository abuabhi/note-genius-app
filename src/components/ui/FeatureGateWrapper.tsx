import React from 'react';
import { useFeatureGate, FeatureGates } from '@/hooks/useFeatureGate';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateWrapperProps {
  children: React.ReactNode;
  featureKey: keyof typeof FeatureGates;
  fallback?: React.ReactNode;
  showPromptOnBlock?: boolean;
}

export const FeatureGateWrapper: React.FC<FeatureGateWrapperProps> = ({
  children,
  featureKey,
  fallback,
  showPromptOnBlock = false
}) => {
  const { checkFeatureAccess, userTier, showUpgradePrompt, dismissUpgradePrompt } = useFeatureGate();
  const featureConfig = FeatureGates[featureKey];
  
  const hasAccess = checkFeatureAccess(featureConfig);

  if (!hasAccess) {
    if (showPromptOnBlock) {
      return (
        <UpgradePrompt
          currentTier={userTier}
          feature={featureConfig.feature}
          reason={`${featureConfig.feature} is available starting from ${featureConfig.requiredTier} tier`}
          onDismiss={dismissUpgradePrompt}
          compact={true}
        />
      );
    }
    
    return fallback || null;
  }

  return (
    <>
      {children}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <UpgradePrompt
              currentTier={userTier}
              feature={featureConfig.feature}
              onDismiss={dismissUpgradePrompt}
            />
          </div>
        </div>
      )}
    </>
  );
};