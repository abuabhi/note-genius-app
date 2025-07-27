import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Brain, Sparkles, ArrowUp, Settings, BarChart3 } from "lucide-react";
import { useState } from "react";
import { UpgradeDialog } from "@/components/ui/UpgradeDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface TierStatusCardProps {
  isCollapsed: boolean;
}

interface UsageStats {
  notesCount: number;
  flashcardSetsCount: number;
  storageUsed: number;
}

export const TierStatusCard = ({ isCollapsed }: TierStatusCardProps) => {
  const { userTier, tierLimits, isLoading } = useUserTier();
  const { subscribed, subscriptionTier } = useSubscription();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<'GRADUATE' | 'MASTER'>('GRADUATE');

  const { data: usageStats, isLoading: isLoadingUsage } = useQuery({
    queryKey: ["userUsageStats"],
    queryFn: async (): Promise<UsageStats> => {
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
  });

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  const getTierConfig = () => {
    switch (userTier) {
      case UserTier.SCHOLAR:
        return { 
          name: 'Scholar', 
          icon: Brain, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        };
      case UserTier.GRADUATE:
        return { 
          name: 'Graduate', 
          icon: Crown, 
          color: 'text-mint-600', 
          bgColor: 'bg-mint-100',
          borderColor: 'border-mint-200'
        };
      case UserTier.MASTER:
        return { 
          name: 'Master', 
          icon: Zap, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200'
        };
      case UserTier.DEAN:
        return { 
          name: 'Dean', 
          icon: Sparkles, 
          color: 'text-amber-600', 
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-200'
        };
      default:
        return { 
          name: 'Scholar', 
          icon: Brain, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getNextTierUpgrade = () => {
    if (userTier === UserTier.SCHOLAR) {
      return { tier: 'GRADUATE' as const, name: 'Graduate', benefits: 'AI features + more storage' };
    } else if (userTier === UserTier.GRADUATE) {
      return { tier: 'MASTER' as const, name: 'Master', benefits: 'Advanced AI + unlimited' };
    }
    return null;
  };

  const tierConfig = getTierConfig();
  const nextTier = getNextTierUpgrade();

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const formatLimit = (limit: number) => limit === -1 ? "∞" : limit.toString();

  const handleUpgrade = () => {
    if (nextTier) {
      setSelectedUpgradeTier(nextTier.tier);
      setUpgradeDialogOpen(true);
    }
  };

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center space-y-2 p-2">
        <div className={`w-8 h-8 ${tierConfig.bgColor} rounded-full flex items-center justify-center`}>
          <tierConfig.icon className={`h-4 w-4 ${tierConfig.color}`} />
        </div>
        {nextTier && (
          <Button 
            size="sm" 
            onClick={handleUpgrade}
            className="w-8 h-8 p-0 bg-mint-500 hover:bg-mint-600 text-white"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* Current Tier Header */}
      <div className={`border ${tierConfig.borderColor} rounded-lg p-3 bg-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 ${tierConfig.bgColor} rounded-full flex items-center justify-center`}>
              <tierConfig.icon className={`h-3 w-3 ${tierConfig.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Current Plan</p>
              <p className={`text-sm font-semibold ${tierConfig.color}`}>{tierConfig.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link to="/settings?tab=subscription">
              <Settings className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      {tierLimits && usageStats && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Usage</span>
          </div>
          
          <div className="space-y-2">
            {/* Notes */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Notes</span>
                <span className="font-medium">
                  {usageStats.notesCount}/{formatLimit(tierLimits.max_notes)}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.notesCount, tierLimits.max_notes)}
                className="h-1"
              />
            </div>

            {/* Flashcard Sets */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Flashcard Sets</span>
                <span className="font-medium">
                  {usageStats.flashcardSetsCount}/{formatLimit(tierLimits.max_flashcard_sets)}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.flashcardSetsCount, tierLimits.max_flashcard_sets)}
                className="h-1"
              />
            </div>

            {/* Storage */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium">
                  {usageStats.storageUsed} MB/{formatLimit(tierLimits.max_storage_mb)} MB
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usageStats.storageUsed, tierLimits.max_storage_mb)}
                className="h-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Section */}
      {nextTier && (
        <div className="border border-mint-200 rounded-lg p-3 bg-gradient-to-r from-mint-50 to-emerald-50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-900">Upgrade to {nextTier.name}</p>
                <p className="text-xs text-mint-600">{nextTier.benefits}</p>
              </div>
              <ArrowUp className="h-4 w-4 text-mint-600" />
            </div>
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="w-full bg-mint-500 hover:bg-mint-600 text-white text-xs"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Show manage subscription for max tier */}
      {userTier === UserTier.MASTER && subscribed && (
        <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-900">Subscription Active</p>
              <p className="text-xs text-purple-600">Manage your plan</p>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link to="/settings?tab=subscription">
                Manage
              </Link>
            </Button>
          </div>
        </div>
      )}

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        currentTier={userTier}
        targetTier={selectedUpgradeTier}
      />
    </div>
  );
};