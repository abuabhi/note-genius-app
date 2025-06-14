
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, RefreshCw, Settings } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { format } from 'date-fns';

export const SubscriptionStatus: React.FC = () => {
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    isLoading,
    checkSubscriptionStatus,
    openCustomerPortal,
  } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  if (!subscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              You're currently on the Scholar (free) tier.
            </p>
            <p className="text-sm text-gray-500">
              Upgrade to unlock premium features and remove limitations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Current Plan:</span>
              <Badge className="bg-mint-500 text-white">
                {subscriptionTier}
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
            <strong>Active Subscription</strong> - You have access to all {subscriptionTier?.toLowerCase()} tier features including advanced AI capabilities, increased limits, and priority support.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
