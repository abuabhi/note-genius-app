
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, RefreshCw, Settings, Crown, Calendar } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUserTier, UserTier } from '@/hooks/useUserTier';
import { format } from 'date-fns';

export const SubscriptionManagementCard: React.FC = () => {
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    isLoading,
    checkSubscriptionStatus,
    openCustomerPortal,
  } = useSubscription();
  
  const { userTier } = useUserTier();
  
  // Check if user is on Dean tier (highest tier)
  const isDeanTier = userTier === UserTier.DEAN;

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Current Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* DEAN tier users */}
        {isDeanTier && (
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2">
                <Crown className="h-4 w-4 mr-2" />
                DEAN TIER
              </Badge>
            </div>
            <p className="text-gray-600 mb-2 font-medium">
              You're on the highest tier available!
            </p>
            <p className="text-sm text-gray-500">
              You have access to all premium features and unlimited usage.
            </p>
          </div>
        )}

        {/* Non-subscribed users (Scholar tier) */}
        {!subscribed && !isDeanTier && (
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline">
                SCHOLAR TIER
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">
              You're currently on the Scholar (free) tier.
            </p>
            <p className="text-sm text-gray-500">
              Upgrade to unlock premium features and remove limitations.
            </p>
          </div>
        )}

        {/* Subscribed users (Graduate/Master tier) */}
        {subscribed && !isDeanTier && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Current Plan:</span>
                  <Badge className="bg-mint-500 text-white">
                    {subscriptionTier || userTier}
                  </Badge>
                </div>
                {subscriptionEnd && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Renews on {format(new Date(subscriptionEnd), 'PPP')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkSubscriptionStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageSubscription}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="bg-mint-50 p-4 rounded-lg">
              <p className="text-sm text-mint-800">
                <strong>Active Subscription</strong> - You have access to all {(subscriptionTier || userTier)?.toLowerCase()} tier features including advanced AI capabilities, increased limits, and priority support.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
