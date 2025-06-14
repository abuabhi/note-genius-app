
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Crown, Zap, Shield, Check, X, CreditCard, RefreshCw, Settings, Calendar } from "lucide-react";
import { format } from 'date-fns';

const tierBadgeVariants = {
  [UserTier.SCHOLAR]: "outline",
  [UserTier.GRADUATE]: "secondary", 
  [UserTier.MASTER]: "default",
  [UserTier.DEAN]: "destructive",
};

const tierIcons = {
  [UserTier.SCHOLAR]: Crown,
  [UserTier.GRADUATE]: Zap,
  [UserTier.MASTER]: Shield,
  [UserTier.DEAN]: Crown,
};

const tierPricing = {
  [UserTier.SCHOLAR]: { price: "Free", monthly: 0 },
  [UserTier.GRADUATE]: { price: "$9.99", monthly: 999 },
  [UserTier.MASTER]: { price: "$19.99", monthly: 1999 },
  [UserTier.DEAN]: { price: "Premium", monthly: 0 },
};

export const MergedSubscriptionCard = () => {
  const { userTier, tierLimits, isLoading } = useUserTier();
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    isLoading: subLoading, 
    checkSubscriptionStatus, 
    openCustomerPortal,
    createCheckoutSession 
  } = useSubscription();
  
  // Fetch usage stats
  const { data: usageStats, isLoading: isLoadingUsage } = useQuery({
    queryKey: ["userUsageStats"],
    queryFn: async () => {
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });
      
      const { count: flashcardSetsCount } = await supabase
        .from('flashcard_sets')
        .select('*', { count: 'exact', head: true });
      
      const { data: notes } = await supabase
        .from('notes')
        .select('content');
        
      const contentSize = notes?.reduce((total, note) => {
        return total + (note.content ? note.content.length * 2 : 0);
      }, 0) || 0;
      
      const storageMB = Math.round((contentSize / (1024 * 1024)) * 100) / 100;
      
      return {
        notesCount: notesCount || 0,
        flashcardSetsCount: flashcardSetsCount || 0,
        storageUsed: storageMB || 0,
      };
    },
    enabled: !!userTier,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const formatLimitDisplay = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toString();
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  const handleUpgrade = async (targetTier: UserTier) => {
    try {
      if (targetTier === UserTier.GRADUATE) {
        await createCheckoutSession('GRADUATE', 'monthly');
      } else if (targetTier === UserTier.MASTER) {
        await createCheckoutSession('MASTER', 'monthly');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const isDeanTier = userTier === UserTier.DEAN;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const TierIcon = tierIcons[userTier];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Current Plan & Usage
        </CardTitle>
        <CardDescription>
          Your subscription status and resource usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Section */}
        <div className="space-y-4">
          {/* DEAN tier users */}
          {isDeanTier && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-3">
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

          {/* Subscribed users (Graduate/Master tier) */}
          {subscribed && !isDeanTier && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <TierIcon className="h-5 w-5 text-mint-600" />
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
                    disabled={subLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${subLoading ? 'animate-spin' : ''}`} />
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
            </div>
          )}

          {/* Non-subscribed users (Scholar tier) */}
          {!subscribed && !isDeanTier && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge variant="outline">
                  SCHOLAR TIER
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">
                You're currently on the Scholar (free) tier.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => handleUpgrade(UserTier.GRADUATE)} size="sm">
                  Upgrade to Graduate ($9.99/mo)
                </Button>
                <Button onClick={() => handleUpgrade(UserTier.MASTER)} variant="outline" size="sm">
                  Upgrade to Master ($19.99/mo)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Usage Overview - Only show if we have tier limits */}
        {tierLimits && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Resource Usage</h4>
            {isLoadingUsage ? (
              <div className="flex items-center justify-center h-24">
                <Loader className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Notes</span>
                    <span className="text-muted-foreground">
                      {usageStats?.notesCount || 0} / {formatLimitDisplay(tierLimits.max_notes)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usageStats?.notesCount || 0, tierLimits.max_notes)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Flashcard Sets</span>
                    <span className="text-muted-foreground">
                      {usageStats?.flashcardSetsCount || 0} / {formatLimitDisplay(tierLimits.max_flashcard_sets)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usageStats?.flashcardSetsCount || 0, tierLimits.max_flashcard_sets)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Storage</span>
                    <span className="text-muted-foreground">
                      {usageStats?.storageUsed || 0} MB / {formatLimitDisplay(tierLimits.max_storage_mb)} MB
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usageStats?.storageUsed || 0, tierLimits.max_storage_mb)}
                    className="h-2"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Access */}
        {tierLimits && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Feature Access</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                {tierLimits.ai_features_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>AI Features</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.ai_flashcard_generation ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>AI Flashcard Generation</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.note_enrichment_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>Note Enrichment</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.ocr_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>OCR Scanning</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.collaboration_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>Collaboration</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.priority_support ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span>Priority Support</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
