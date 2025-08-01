import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Crown, Zap, Users, Star, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TierDropdownProps {
  isCollapsed: boolean;
}

const tierIcons = {
  [UserTier.SCHOLAR]: Users,
  [UserTier.GRADUATE]: Star,
  [UserTier.MASTER]: Zap,
  [UserTier.DEAN]: Crown,
};

const tierColors = {
  [UserTier.SCHOLAR]: "text-slate-600",
  [UserTier.GRADUATE]: "text-blue-600", 
  [UserTier.MASTER]: "text-purple-600",
  [UserTier.DEAN]: "text-amber-600",
};

const nextTierMap = {
  [UserTier.SCHOLAR]: UserTier.GRADUATE,
  [UserTier.GRADUATE]: UserTier.MASTER,
  [UserTier.MASTER]: UserTier.DEAN,
  [UserTier.DEAN]: null,
};

export const TierDropdown = ({ isCollapsed }: TierDropdownProps) => {
  const { userTier, tierLimits, isLoading } = useUserTier();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const TierIcon = tierIcons[userTier];
  const nextTier = nextTierMap[userTier];

  // Query for notes count
  const { data: notesCount = 0 } = useQuery({
    queryKey: ['notes-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('archived', false);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Query for flashcard sets count
  const { data: flashcardSetsCount = 0 } = useQuery({
    queryKey: ['flashcard-sets-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('flashcard_sets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Query for AI enrichment usage
  const { data: aiEnrichmentCount = 0 } = useQuery({
    queryKey: ['ai-enrichment-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('note_enrichment_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="px-3">
        <div className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 bg-muted/50">
          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
          {!isCollapsed && <div className="h-4 flex-1 rounded bg-muted animate-pulse" />}
        </div>
      </div>
    );
  }

  const getUsageStats = () => {
    if (!tierLimits) return [];

    const stats = [
      {
        label: "Notes",
        current: notesCount,
        max: tierLimits.max_notes === -1 ? "Unlimited" : tierLimits.max_notes,
        percentage: tierLimits.max_notes === -1 ? 0 : Math.round((notesCount / tierLimits.max_notes) * 100),
        icon: Brain,
      },
      {
        label: "Flashcard Sets", 
        current: flashcardSetsCount,
        max: tierLimits.max_flashcard_sets === -1 ? "Unlimited" : tierLimits.max_flashcard_sets,
        percentage: tierLimits.max_flashcard_sets === -1 ? 0 : Math.round((flashcardSetsCount / tierLimits.max_flashcard_sets) * 100),
        icon: Zap,
      },
      {
        label: "AI Enrichment",
        current: aiEnrichmentCount,
        max: tierLimits.note_enrichment_limit_per_month === -1 ? "Unlimited" : tierLimits.note_enrichment_limit_per_month || 0,
        percentage: tierLimits.note_enrichment_limit_per_month === -1 ? 0 : Math.round((aiEnrichmentCount / (tierLimits.note_enrichment_limit_per_month || 1)) * 100),
        icon: Sparkles,
      },
    ];

    return stats;
  };

  const usageStats = getUsageStats();

  return (
    <div className="px-3">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="w-full">
          <div className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
            <TierIcon className={`h-4 w-4 ${tierColors[userTier]}`} />
            {!isCollapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">
                  Current Plan: {userTier}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          side="right" 
          sideOffset={8}
          className="w-72 p-4 bg-background border shadow-lg"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <TierIcon className={`h-5 w-5 ${tierColors[userTier]}`} />
              <div>
                <h4 className="font-semibold text-foreground">{userTier} Plan</h4>
                <p className="text-xs text-muted-foreground">Your current subscription</p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Usage</p>
              {usageStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-muted-foreground">
                      {stat.current}/{stat.max}
                    </span>
                  </div>
                  {typeof stat.max === 'number' && (
                    <Progress value={stat.percentage} className="h-1.5" />
                  )}
                </div>
              ))}
            </div>

            {/* Upgrade Section */}
            {nextTier ? (
              <div className="pt-2 border-t">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate('/upgrade')}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Upgrade to {nextTier}
                </Button>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Unlock more features and higher limits
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate('/settings/subscription')}
                >
                  Manage Subscription
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};