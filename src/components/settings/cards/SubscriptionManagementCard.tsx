
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
  
  // Check if user is on Dean tier (highest tier)
  const isDeanTier = userTier === UserTier.DEAN;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionStatus />
          
          {!subscribed && !isDeanTier && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
              <SubscriptionPlans />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
