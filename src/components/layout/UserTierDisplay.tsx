
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { CirclePercent, BarChart, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { startTransition } from "react";

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
  storageUsed: number;
}

export function UserTierDisplay() {
  const { userTier, tierLimits, isLoading } = useUserTier();
  const navigate = useNavigate();
  
  const { data: usageStats, isLoading: isLoadingUsage } = useQuery({
    queryKey: ["userUsageStats"],
    queryFn: async () => {
      // Get notes count
      const { count: notesCount, error: notesError } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });
      
      if (notesError) console.error('Error fetching notes count:', notesError);
      
      // Fix: Get flashcard sets count instead of flashcards count
      const { count: flashcardSetsCount, error: flashcardSetsError } = await supabase
        .from('flashcard_sets')
        .select('*', { count: 'exact', head: true });
      
      if (flashcardSetsError) console.error('Error fetching flashcard sets count:', flashcardSetsError);
      
      // Get actual storage used - calculate based on note content size
      const { data: notes, error: contentError } = await supabase
        .from('notes')
        .select('content');
        
      if (contentError) console.error('Error fetching notes content:', contentError);
      
      // Calculate storage used by the notes content
      const contentSize = notes?.reduce((total, note) => {
        // Calculate bytes in content: 2 bytes per character (UTF-16)
        return total + (note.content ? note.content.length * 2 : 0);
      }, 0) || 0;
      
      // Convert bytes to MB with 2 decimal places
      const storageMB = Math.round((contentSize / (1024 * 1024)) * 100) / 100;
      
      return {
        notesCount: notesCount || 0,
        flashcardSetsCount: flashcardSetsCount || 0,
        storageUsed: storageMB || 0,
      };
    },
    enabled: !!userTier,
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
                <BarChart className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Storage</span>
              </div>
              <span className="text-xs font-medium">
                {isLoadingUsage ? '...' : `${usageStats?.storageUsed || 0} MB`}/
                {formatLimitDisplay(tierLimits.max_storage_mb)} MB
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 45 : getUsagePercentage(usageStats?.storageUsed || 0, tierLimits.max_storage_mb)}
              className="h-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
