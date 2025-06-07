import React, { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Crown, Zap, Shield, Check, X } from "lucide-react";
import { MockStripeIntegration } from "./MockStripeIntegration";

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

interface UsageStats {
  notesCount: number;
  flashcardSetsCount: number;
  storageUsed: number;
}

// Separate component for usage data to isolate suspense boundary
const UsageDisplay = ({ userTier }: { userTier: UserTier }) => {
  const { data: usageStats, isLoading: isLoadingUsage } = useQuery({
    queryKey: ["userUsageStats"],
    queryFn: async () => {
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });
      
      // Fix: Query flashcard_sets table instead of flashcards table
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  return { usageStats, isLoadingUsage };
};

export const SubscriptionLimitsCard = () => {
  const { userTier, tierLimits, isLoading } = useUserTier();

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const formatLimitDisplay = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toString();
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
      {/* Current Tier Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TierIcon className={`h-6 w-6 ${userTier ? tierColors[userTier] : 'text-gray-600'}`} />
              <div>
                <CardTitle className="flex items-center gap-2">
                  Current Plan
                  {userTier && (
                    <Badge variant={tierBadgeVariants[userTier] as any}>
                      {userTier}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Manage your subscription and view usage limits
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mock Stripe Integration - Upgrade and Billing Management */}
      {userTier && (
        <MockStripeIntegration userTier={userTier} />
      )}

      {/* Usage Overview */}
      {tierLimits && userTier && (
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>Loading usage data...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        }>
          <UsageCard userTier={userTier} tierLimits={tierLimits} />
        </Suspense>
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

// Separate component for usage card to handle data fetching
const UsageCard = ({ userTier, tierLimits }: { userTier: UserTier, tierLimits: any }) => {
  const { usageStats, isLoadingUsage } = UsageDisplay({ userTier });

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const formatLimitDisplay = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Usage</CardTitle>
        <CardDescription>
          Monitor your usage against your plan limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notes Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Notes</span>
            <span className="text-muted-foreground">
              {isLoadingUsage ? '...' : `${usageStats?.notesCount || 0} / ${formatLimitDisplay(tierLimits.max_notes)}`}
            </span>
          </div>
          <Progress 
            value={isLoadingUsage ? 0 : getUsagePercentage(usageStats?.notesCount || 0, tierLimits.max_notes)}
            className="h-2"
          />
        </div>

        {/* Flashcard Sets Usage - Fixed to show correct count */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Flashcard Sets</span>
            <span className="text-muted-foreground">
              {isLoadingUsage ? '...' : `${usageStats?.flashcardSetsCount || 0} / ${formatLimitDisplay(tierLimits.max_flashcard_sets)}`}
            </span>
          </div>
          <Progress 
            value={isLoadingUsage ? 0 : getUsagePercentage(usageStats?.flashcardSetsCount || 0, tierLimits.max_flashcard_sets)}
            className="h-2"
          />
        </div>

        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Storage</span>
            <span className="text-muted-foreground">
              {isLoadingUsage ? '...' : `${usageStats?.storageUsed || 0} MB / ${formatLimitDisplay(tierLimits.max_storage_mb)} MB`}
            </span>
          </div>
          <Progress 
            value={isLoadingUsage ? 0 : getUsagePercentage(usageStats?.storageUsed || 0, tierLimits.max_storage_mb)}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
