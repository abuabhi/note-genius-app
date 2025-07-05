import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, ArrowUp, X } from 'lucide-react';
import { UserTier } from '@/hooks/useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface UpgradePromptProps {
  currentTier: UserTier;
  feature?: string;
  reason?: string;
  onDismiss?: () => void;
  compact?: boolean;
}

const tierInfo = {
  [UserTier.GRADUATE]: {
    name: 'Graduate',
    price: '$9.99/mo',
    icon: Crown,
    color: 'mint',
    benefits: ['100 notes', '25 flashcard sets', 'AI features', 'OCR scanning']
  },
  [UserTier.MASTER]: {
    name: 'Master',
    price: '$19.99/mo', 
    icon: Zap,
    color: 'purple',
    benefits: ['250 notes', '50 flashcard sets', 'Unlimited AI', 'Priority support']
  }
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  currentTier,
  feature,
  reason,
  onDismiss,
  compact = false
}) => {
  const { createCheckoutSession } = useSubscription();

  // Determine target tier based on current tier
  const getTargetTier = () => {
    if (currentTier === UserTier.SCHOLAR) return UserTier.GRADUATE;
    if (currentTier === UserTier.GRADUATE) return UserTier.MASTER;
    return UserTier.MASTER; // Fallback
  };

  const targetTier = getTargetTier();
  const targetInfo = tierInfo[targetTier];
  const TargetIcon = targetInfo.icon;

  const handleUpgrade = async () => {
    try {
      await createCheckoutSession(targetTier as 'GRADUATE' | 'MASTER', 'monthly');
    } catch (error) {
      console.error('Error upgrading:', error);
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-mint-50 to-emerald-50 border border-mint-200 rounded-lg p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TargetIcon className="h-4 w-4 text-mint-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {feature ? `${feature} requires ${targetInfo.name}` : `Upgrade to ${targetInfo.name}`}
              </p>
              <p className="text-xs text-gray-600">{targetInfo.price}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={handleUpgrade} className="h-7 px-2 text-xs">
              Upgrade
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 w-7 p-0">
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-emerald-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-mint-600" />
            <CardTitle className="text-lg">Upgrade to {targetInfo.name}</CardTitle>
            <Badge className="bg-mint-500 text-white text-xs">{targetInfo.price}</Badge>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {reason || `Unlock ${targetInfo.name} features and boost your learning potential`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {targetInfo.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-mint-500 rounded-full"></div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        
        <Button onClick={handleUpgrade} className="w-full bg-mint-600 hover:bg-mint-700">
          <ArrowUp className="h-4 w-4 mr-2" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
};