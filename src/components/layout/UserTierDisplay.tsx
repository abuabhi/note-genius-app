
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { CirclePercent, BarChart, ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { startTransition } from "react";
import { useAuth } from "@/hooks/auth/useAuth";

// Updated badge variants to match the mint theme
const tierBadgeVariants = {
  [UserTier.SCHOLAR]: "outline",
  [UserTier.GRADUATE]: "secondary",
  [UserTier.MASTER]: "default",
  [UserTier.DEAN]: "info",
};

interface UsageStats {
  notesCount: number;
  flashcardSetsCount: number;
  aiEnrichmentUsage: number;
  aiFlashcardGenerationUsage: number;
}

export function UserTierDisplay() {
  const { userTier, tierLimits, isLoading } = useUserTier();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: usageStats, isLoading: isLoadingUsage } = useQuery({
    queryKey: ["userUsageStats", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('❌ [UserTierDisplay] No user ID found');
        return null;
      }
      
      console.log('🔍 [UserTierDisplay] Fetching usage stats for user:', user.id);
      
      // Get notes count with user filter
      const { count: notesCount, error: notesError } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (notesError) {
        console.error('❌ Error fetching notes count:', notesError);
      } else {
        console.log('📝 [UserTierDisplay] Notes count:', notesCount);
      }
      
      // Get flashcard sets count with user filter
      const { count: flashcardSetsCount, error: flashcardSetsError } = await supabase
        .from('flashcard_sets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (flashcardSetsError) {
        console.error('❌ Error fetching flashcard sets count:', flashcardSetsError);
      } else {
        console.log('🃏 [UserTierDisplay] Flashcard sets count:', flashcardSetsCount);
      }
      
      // Get AI enrichment usage for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { count: aiEnrichmentCount, error: aiError } = await supabase
        .from('note_enrichment_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('month_year', currentMonth);
      
      if (aiError) {
        console.error('❌ Error fetching AI enrichment usage:', aiError);
      } else {
        console.log('✨ [UserTierDisplay] AI enrichment count:', aiEnrichmentCount);
      }
      
      // Get AI flashcard generation usage (if this exists in your system)
      // This is a placeholder - adjust based on your actual AI flashcard tracking
      const aiFlashcardGenerationUsage = 0; // TODO: implement if needed
      
      const result = {
        notesCount: notesCount || 0,
        flashcardSetsCount: flashcardSetsCount || 0,
        aiEnrichmentUsage: aiEnrichmentCount || 0,
        aiFlashcardGenerationUsage,
      };
      
      console.log('📊 [UserTierDisplay] Final usage stats:', result);
      return result;
    },
    enabled: !!userTier && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false, // Prevent automatic refetch on focus
  });
  
  if (isLoading || !userTier) {
    return (
      <div className="px-3 py-2 space-y-2">
        <div className="h-5 bg-sidebar-accent animate-pulse rounded" />
        <div className="h-3 bg-sidebar-accent animate-pulse rounded w-2/3" />
      </div>
    );
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0; // Unlimited or zero limit
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const formatLimitDisplay = (limit: number) => {
    if (limit === -1) return "∞";
    return limit.toString();
  };

  const handleTierClick = () => {
    startTransition(() => {
      navigate('/settings?tab=subscription');
    });
  };

  return (
    <div className="px-3 py-3 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTierClick}
          className="p-0 h-auto hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
        >
          <Badge variant={tierBadgeVariants[userTier] as any} className="px-2 py-1 hover:shadow-sm transition-shadow">
            {userTier}
            <ArrowRight className="h-3 w-3 ml-1 opacity-60" />
          </Badge>
        </Button>
        
        <Button variant="ghost" size="sm" asChild className="text-xs px-2">
          <Link to="/pricing">Upgrade</Link>
        </Button>
      </div>
      
      {tierLimits && (
        <div className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <BarChart className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Notes</span>
              </div>
              <span className="text-xs font-medium">
                {isLoadingUsage ? '...' : usageStats?.notesCount || 0}/
                {formatLimitDisplay(tierLimits.max_notes)}
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 15 : getUsagePercentage(usageStats?.notesCount || 0, tierLimits.max_notes)}
              className="h-1"
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <CirclePercent className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Flashcard Sets</span>
              </div>
              <span className="text-xs font-medium">
                {isLoadingUsage ? '...' : usageStats?.flashcardSetsCount || 0}/
                {formatLimitDisplay(tierLimits.max_flashcard_sets)}
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 30 : getUsagePercentage(usageStats?.flashcardSetsCount || 0, tierLimits.max_flashcard_sets)}
              className="h-1"
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">AI Enrichment</span>
              </div>
              <span className="text-xs font-medium">
                {isLoadingUsage ? '...' : usageStats?.aiEnrichmentUsage || 0}/
                {formatLimitDisplay(tierLimits.note_enrichment_limit_per_month)}
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 20 : getUsagePercentage(usageStats?.aiEnrichmentUsage || 0, tierLimits.note_enrichment_limit_per_month)}
              className="h-1"
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">AI Flash Creation</span>
              </div>
              <span className="text-xs font-medium">
                {isLoadingUsage ? '...' : usageStats?.aiFlashcardGenerationUsage || 0}/50
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 10 : getUsagePercentage(usageStats?.aiFlashcardGenerationUsage || 0, 50)}
              className="h-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
