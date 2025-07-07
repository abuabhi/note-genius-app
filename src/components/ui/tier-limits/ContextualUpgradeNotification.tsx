import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  X, 
  ArrowRight,
  Crown,
  Zap,
  Clock
} from 'lucide-react';
import { UserTier } from '@/hooks/useUserTier';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';

interface ContextualUpgradeNotificationProps {
  isVisible: boolean;
  onDismiss: () => void;
  currentTier: UserTier;
  trigger: 'high-usage' | 'engagement' | 'limit-approaching' | 'feature-blocked';
  feature?: string;
  usagePercentage?: number;
  className?: string;
}

export const ContextualUpgradeNotification: React.FC<ContextualUpgradeNotificationProps> = ({
  isVisible,
  onDismiss,
  currentTier,
  trigger,
  feature,
  usagePercentage,
  className
}) => {
  const { createCheckoutSession } = useSubscription();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
    }
  }, [isVisible]);

  const getUpgradeInfo = () => {
    if (currentTier === UserTier.SCHOLAR) {
      return { tier: 'GRADUATE' as const, name: 'Graduate', price: '$9.99' };
    } else if (currentTier === UserTier.GRADUATE) {
      return { tier: 'MASTER' as const, name: 'Master', price: '$19.99' };
    }
    return null;
  };

  const upgradeInfo = getUpgradeInfo();

  const getNotificationContent = () => {
    switch (trigger) {
      case 'high-usage':
        return {
          icon: <TrendingUp className="h-5 w-5 text-green-600" />,
          title: "You're on fire! 🔥",
          message: `You've used ${usagePercentage}% of your ${feature}. You're clearly getting value!`,
          cta: "Unlock unlimited potential",
          color: "border-green-200 bg-green-50"
        };
      case 'engagement':
        return {
          icon: <Sparkles className="h-5 w-5 text-purple-600" />,
          title: "Loving the app? ✨",
          message: "Students like you typically upgrade after seeing these results!",
          cta: "Join the top performers",
          color: "border-purple-200 bg-purple-50"
        };
      case 'limit-approaching':
        return {
          icon: <Clock className="h-5 w-5 text-orange-600" />,
          title: "Almost at your limit",
          message: `You've used ${usagePercentage}% of your ${feature}. Don't let limits slow you down!`,
          cta: "Upgrade before you're stuck",
          color: "border-orange-200 bg-orange-50"
        };
      case 'feature-blocked':
        return {
          icon: <Zap className="h-5 w-5 text-red-600" />,
          title: "Feature locked 🔒",
          message: `${feature} is available with ${upgradeInfo?.name}. Don't miss out!`,
          cta: "Unlock this feature",
          color: "border-red-200 bg-red-50"
        };
      default:
        return {
          icon: <Crown className="h-5 w-5 text-primary" />,
          title: "Ready to level up?",
          message: "Upgrade to unlock your full potential",
          cta: "Explore premium features",
          color: "border-primary/20 bg-primary/5"
        };
    }
  };

  const handleUpgrade = async () => {
    if (upgradeInfo) {
      try {
        await createCheckoutSession(upgradeInfo.tier, 'monthly');
      } catch (error) {
        console.error('Error upgrading:', error);
      }
    }
  };

  if (!isVisible || !upgradeInfo) return null;

  const content = getNotificationContent();

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-500 ease-out",
      showAnimation ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
      className
    )}>
      <Card className={cn(
        "shadow-lg border-2 transition-all duration-300",
        content.color,
        isExpanded ? "scale-105" : "hover:scale-102"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {content.icon}
              <h3 className="font-semibold text-sm">{content.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {upgradeInfo.price}/mo
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {content.message}
          </p>

          {!isExpanded ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="flex-1 text-xs"
              >
                Learn More
              </Button>
              <Button
                size="sm"
                onClick={handleUpgrade}
                className="flex-1 text-xs"
              >
                {content.cta}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-green-600" />
                  <span>15k+ upgrades</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span>+0.8 GPA avg</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleUpgrade}
                  className="w-full text-sm"
                  size="sm"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to {upgradeInfo.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="w-full text-xs"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};