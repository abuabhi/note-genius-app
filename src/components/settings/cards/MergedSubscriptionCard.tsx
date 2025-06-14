
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Crown, Zap, Shield, Check, X, CreditCard, RefreshCw, Settings, Calendar, Sparkles } from "lucide-react";
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
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-center h-48">
          <Loader className="h-6 w-6 animate-spin text-mint-600" />
        </CardContent>
      </Card>
    );
  }

  const TierIcon = tierIcons[userTier];

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-mint-600" />
          Plan & Usage
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Your subscription and resource overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Section */}
        <div className="space-y-4">
          {/* DEAN tier users */}
          {isDeanTier && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200/50">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-medium shadow-sm">
                    <Crown className="h-4 w-4 mr-2" />
                    DEAN TIER
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold mb-1">
                    Highest tier unlocked!
                  </p>
                  <p className="text-gray-600 text-sm">
                    All premium features with unlimited usage
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscribed users (Graduate/Master tier) */}
          {subscribed && !isDeanTier && (
            <div className="bg-gradient-to-r from-mint-50 to-emerald-50 rounded-xl p-4 border border-mint-200/50">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TierIcon className="h-4 w-4 text-mint-600" />
                    <span className="font-medium text-gray-800">Active Plan:</span>
                    <Badge className="bg-mint-500 text-white text-xs px-2 py-1">
                      {subscriptionTier || userTier}
                    </Badge>
                  </div>
                  {subscriptionEnd && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>Renews {format(new Date(subscriptionEnd), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkSubscriptionStatus}
                    disabled={subLoading}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${subLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    className="h-8 px-3 text-xs"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Non-subscribed users (Scholar tier) */}
          {!subscribed && !isDeanTier && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200/50">
              <div className="text-center space-y-3">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  SCHOLAR TIER
                </Badge>
                <div>
                  <p className="text-gray-700 text-sm mb-3">
                    Currently on the free tier
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button onClick={() => handleUpgrade(UserTier.GRADUATE)} size="sm" className="text-xs px-3 py-1">
                      Graduate $9.99/mo
                    </Button>
                    <Button onClick={() => handleUpgrade(UserTier.MASTER)} variant="outline" size="sm" className="text-xs px-3 py-1">
                      Master $19.99/mo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Usage Overview - Only show if we have tier limits */}
        {tierLimits && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-mint-600" />
              Resource Usage
            </h4>
            {isLoadingUsage ? (
              <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg">
                <Loader className="h-4 w-4 animate-spin text-mint-600" />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Notes</span>
                    <span className="text-gray-500 text-xs">
                      {usageStats?.notesCount || 0} / {formatLimitDisplay(tierLimits.max_notes)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usageStats?.notesCount || 0, tierLimits.max_notes)}
                    className="h-1.5"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Flashcard Sets</span>
                    <span className="text-gray-500 text-xs">
                      {usageStats?.flashcardSetsCount || 0} / {formatLimitDisplay(tierLimits.max_flashcard_sets)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usageStats?.flashcardSetsCount || 0, tierLimits.max_flashcard_sets)}
                    className="h-1.5"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Storage</span>
                    <span className="text-gray-500 text-xs">
                      {usageStats?.storageUsed || 0} MB / {formatLimitDisplay(tierLimits.max_storage_mb)} MB
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usageStats?.storageUsed || 0, tierLimits.max_storage_mb)}
                    className="h-1.5"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Access */}
        {tierLimits && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Feature Access</h4>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  {tierLimits.ai_features_enabled ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-gray-700 text-xs">AI Features</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {tierLimits.ai_flashcard_generation ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-gray-700 text-xs">AI Flashcards</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {tierLimits.note_enrichment_enabled ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-gray-700 text-xs">Note Enrichment</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {tierLimits.ocr_enabled ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-gray-700 text-xs">OCR Scanning</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {tierLimits.collaboration_enabled ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-gray-700 text-xs">Collaboration</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {tierLimits.priority_support ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-gray-700 text-xs">Priority Support</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
