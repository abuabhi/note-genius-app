import { useState, useCallback } from 'react';
import { useUserTier, UserTier } from './useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

interface FeatureGateConfig {
  feature: string;
  requiredTier: UserTier;
  usageKey?: string;
  limit?: number;
}

export const useFeatureGate = () => {
  const { userTier, tierLimits } = useUserTier();
  const { createCheckoutSession } = useSubscription();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState<string | null>(null);

  const checkFeatureAccess = useCallback((config: FeatureGateConfig): boolean => {
    const { feature, requiredTier, usageKey, limit } = config;

    // Check tier requirement
    const tierOrder = {
      [UserTier.SCHOLAR]: 0,
      [UserTier.GRADUATE]: 1,
      [UserTier.MASTER]: 2,
      [UserTier.DEAN]: 3
    };

    const hasRequiredTier = tierOrder[userTier] >= tierOrder[requiredTier];

    if (!hasRequiredTier) {
      setBlockedFeature(feature);
      setShowUpgradePrompt(true);
      return false;
    }

    // Check usage limits if specified
    if (usageKey && limit && tierLimits) {
      const currentLimit = (tierLimits as any)[usageKey];
      if (currentLimit !== -1 && currentLimit >= limit) {
        setBlockedFeature(feature);
        setShowUpgradePrompt(true);
        return false;
      }
    }

    return true;
  }, [userTier, tierLimits]);

  const gateFeature = useCallback((config: FeatureGateConfig, callback?: () => void) => {
    const hasAccess = checkFeatureAccess(config);
    
    if (hasAccess && callback) {
      callback();
    } else if (!hasAccess) {
      toast.error(`${config.feature} requires ${config.requiredTier} tier or higher`);
    }

    return hasAccess;
  }, [checkFeatureAccess]);

  const handleUpgrade = useCallback(async () => {
    try {
      const targetTier = userTier === UserTier.SCHOLAR ? 'GRADUATE' : 'MASTER';
      await createCheckoutSession(targetTier, 'monthly');
      setShowUpgradePrompt(false);
    } catch (error) {
      console.error('Error upgrading:', error);
      toast.error('Failed to start upgrade process');
    }
  }, [userTier, createCheckoutSession]);

  const dismissUpgradePrompt = useCallback(() => {
    setShowUpgradePrompt(false);
    setBlockedFeature(null);
  }, []);

  return {
    userTier,
    checkFeatureAccess,
    gateFeature,
    showUpgradePrompt,
    blockedFeature,
    handleUpgrade,
    dismissUpgradePrompt
  };
};

// Pre-configured feature gates for common features
export const FeatureGates = {
  AI_ENRICHMENT: {
    feature: 'AI Note Enrichment',
    requiredTier: UserTier.GRADUATE,
    usageKey: 'note_enrichment_limit_per_month',
    limit: 50
  },
  AI_FLASHCARDS: {
    feature: 'AI Flashcard Generation', 
    requiredTier: UserTier.GRADUATE,
    usageKey: 'max_ai_flashcard_generations_per_month',
    limit: 50
  },
  ADVANCED_ANALYTICS: {
    feature: 'Advanced Analytics',
    requiredTier: UserTier.MASTER
  },
  PRIORITY_SUPPORT: {
    feature: 'Priority Support',
    requiredTier: UserTier.MASTER
  },
  UNLIMITED_COLLABORATIONS: {
    feature: 'Unlimited Collaborations',
    requiredTier: UserTier.MASTER
  }
} as const;