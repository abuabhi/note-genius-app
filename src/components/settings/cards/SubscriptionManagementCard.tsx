
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUserTier, UserTier } from '@/hooks/useUserTier';

export const SubscriptionManagementCard: React.FC = () => {
  const { subscribed, subscriptionTier } = useSubscription();
  const { userTier } = useUserTier();
  
  // Debug logs to see what's happening
  console.log('SubscriptionManagementCard Debug:', {
    userTier,
    subscribed,
    subscriptionTier,
    isDeanTier: userTier === UserTier.DEAN
  });
  
  // Check if user is on Dean tier (highest tier)
  const isDeanTier = userTier === UserTier.DEAN;

  return (
    <div className="space-y-6">
      <SubscriptionStatus />

      {!subscribed && !isDeanTier && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionPlans />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
