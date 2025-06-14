
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Crown, Zap, Shield, Check, X } from "lucide-react";

const tierBadgeVariants = {
  [UserTier.SCHOLAR]: "outline",
  [UserTier.GRADUATE]: "secondary", 
  [UserTier.MASTER]: "default",
  [UserTier.DEAN]: "destructive",
};

const tierColors = {
  [UserTier.SCHOLAR]: "text-gray-600",
  [UserTier.GRADUATE]: "text-blue-600",
  [UserTier.MASTER]: "text-purple-600", 
  [UserTier.DEAN]: "text-amber-600",
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

const tierFeatures = {
  [UserTier.SCHOLAR]: [
    "10 Notes",
    "5 Flashcard Sets", 
    "100MB Storage",
    "Basic Features"
  ],
  [UserTier.GRADUATE]: [
    "100 Notes",
    "25 Flashcard Sets",
    "500MB Storage", 
    "AI Features",
    "OCR Scanning"
  ],
  [UserTier.MASTER]: [
    "250 Notes",
    "50 Flashcard Sets",
    "2GB Storage",
    "Advanced AI Features",
    "Note Enrichment",
    "Priority Support"
  ],
  [UserTier.DEAN]: [
    "Unlimited Notes",
    "Unlimited Flashcard Sets", 
    "10GB Storage",
    "All Premium Features",
    "Priority Support",
    "Early Access"
  ],
};

export const SubscriptionLimitsCard = () => {
  const { userTier, tierLimits, isLoading } = useUserTier();
  const { createCheckoutSession } = useSubscription();
  
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

  const isCurrentTier = (tier: UserTier) => tier === userTier;
  const canUpgradeTo = (tier: UserTier) => {
    const tierOrder = [UserTier.SCHOLAR, UserTier.GRADUATE, UserTier.MASTER, UserTier.DEAN];
    return tierOrder.indexOf(tier) > tierOrder.indexOf(userTier);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const TierIcon = userTier ? tierIcons[userTier] : Crown;

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      {tierLimits && userTier && (
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>
              Monitor your usage against your plan limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingUsage ? (
              <div className="flex items-center justify-center h-32">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans - Only show if not DEAN tier */}
      {userTier !== UserTier.DEAN && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your learning needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(UserTier).filter(tier => tier !== UserTier.DEAN).map((tier) => {
                const TierIcon = tierIcons[tier];
                const isCurrent = isCurrentTier(tier);
                const canUpgrade = canUpgradeTo(tier);
                
                return (
                  <div
                    key={tier}
                    className={`relative rounded-lg border p-4 ${
                      isCurrent 
                        ? 'border-mint-500 bg-mint-50 ring-2 ring-mint-200' 
                        : 'border-gray-200 hover:border-mint-300'
                    }`}
                  >
                    {isCurrent && (
                      <Badge className="absolute -top-2 left-4 bg-mint-600">
                        Current Plan
                      </Badge>
                    )}
                    
                    <div className="text-center space-y-4">
                      <div>
                        <TierIcon className={`h-8 w-8 mx-auto ${
                          isCurrent ? 'text-mint-600' : 'text-gray-500'
                        }`} />
                        <h3 className="font-semibold mt-2">{tier}</h3>
                        <p className="text-2xl font-bold">{tierPricing[tier].price}</p>
                        {tier !== UserTier.SCHOLAR && (
                          <p className="text-sm text-muted-foreground">per month</p>
                        )}
                      </div>
                      
                      <ul className="space-y-2 text-sm">
                        {tierFeatures[tier].map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {canUpgrade && tier !== UserTier.DEAN && (
                        <Button 
                          onClick={() => handleUpgrade(tier)}
                          className="w-full"
                        >
                          Upgrade to {tier}
                        </Button>
                      )}
                      
                      {isCurrent && (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      )}
                      
                      {tier === UserTier.SCHOLAR && !isCurrent && (
                        <Button variant="outline" className="w-full" disabled>
                          Downgrade (Contact Support)
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Access */}
      {tierLimits && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Access</CardTitle>
            <CardDescription>
              Features available with your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {tierLimits.ai_features_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">AI Features</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.ai_flashcard_generation ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">AI Flashcard Generation</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.note_enrichment_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Note Enrichment</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.ocr_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">OCR Scanning</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.collaboration_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Collaboration</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.chat_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Chat Features</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {tierLimits.priority_support ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Priority Support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
