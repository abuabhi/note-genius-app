
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUserTier } from "@/hooks/useUserTier";
import { UserTier } from "@/hooks/useRequireAuth";
import { CirclePercent, BarChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Updated color scheme using mint colors from the theme
const tierColors = {
  [UserTier.SCHOLAR]: "bg-mint-400",
  [UserTier.GRADUATE]: "bg-mint-500",
  [UserTier.MASTER]: "bg-mint-600",
  [UserTier.DEAN]: "bg-mint-700",
};

// Updated badge variants to match the mint theme
const tierBadgeVariants = {
  [UserTier.SCHOLAR]: "outline",
  [UserTier.GRADUATE]: "secondary",
  [UserTier.MASTER]: "default",
  [UserTier.DEAN]: "info",
};

interface UsageStats {
  notesCount: number;
  flashcardsCount: number;
  storageUsed: number;
}

export function UserTierDisplay() {
  const { userTier, isLoading, tierLimits } = useUserTier();
  
  const { data: usageStats, isLoading: isLoadingUsage } = useQuery({
    queryKey: ["userUsageStats"],
    queryFn: async () => {
      // Get notes count
      const { count: notesCount, error: notesError } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });
      
      if (notesError) console.error('Error fetching notes count:', notesError);
      
      // Get flashcards count
      const { count: flashcardsCount, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true });
      
      if (flashcardsError) console.error('Error fetching flashcards count:', flashcardsError);
      
      // For storage, we'd typically track this via file uploads
      // This is a placeholder that could be replaced with actual storage tracking
      const storageUsed = notesCount ? notesCount * 5 : 0; // Rough estimate: 5MB per note
      
      return {
        notesCount: notesCount || 0,
        flashcardsCount: flashcardsCount || 0,
        storageUsed,
      };
    },
    enabled: !!userTier,
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
    if (limit === Infinity || limit === 0) return 100;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  return (
    <div className="px-3 py-3 space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant={tierBadgeVariants[userTier] as any} className="px-2 py-1">
          {userTier}
        </Badge>
        
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
                {tierLimits?.max_notes === Infinity ? "∞" : tierLimits?.max_notes}
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 15 : getUsagePercentage(usageStats?.notesCount || 0, tierLimits?.max_notes || 100)}
              className="h-1"
              indicatorClassName={tierColors[userTier]} 
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <CirclePercent className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Flashcards</span>
              </div>
              <span className="text-xs font-medium">
                {isLoadingUsage ? '...' : usageStats?.flashcardsCount || 0}/
                {tierLimits?.max_flashcards === Infinity ? "∞" : tierLimits?.max_flashcards}
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 30 : getUsagePercentage(usageStats?.flashcardsCount || 0, tierLimits?.max_flashcards || 100)}
              className="h-1"
              indicatorClassName={tierColors[userTier]} 
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <BarChart className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Storage</span>
              </div>
              <span className="text-xs font-medium">
                {isLoadingUsage ? '...' : `${Math.round(usageStats?.storageUsed || 0)} MB`}/
                {tierLimits?.max_storage_mb === Infinity ? "∞" : `${tierLimits?.max_storage_mb} MB`}
              </span>
            </div>
            <Progress 
              value={isLoadingUsage ? 45 : getUsagePercentage(usageStats?.storageUsed || 0, tierLimits?.max_storage_mb || 100)}
              className="h-1"
              indicatorClassName={tierColors[userTier]} 
            />
          </div>
          
          {/* Features list */}
          <div className="pt-1 border-t border-border/40">
            <h4 className="text-xs font-medium mb-1.5">Key features:</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li className="flex items-center gap-1">
                <span className={tierLimits.ocr_enabled ? "text-green-500" : "text-red-500"}>
                  {tierLimits.ocr_enabled ? "✓" : "✗"}
                </span>
                <span>OCR scanning</span>
              </li>
              <li className="flex items-center gap-1">
                <span className={tierLimits.ai_features_enabled ? "text-green-500" : "text-red-500"}>
                  {tierLimits.ai_features_enabled ? "✓" : "✗"}
                </span>
                <span>AI features</span>
              </li>
              <li className="flex items-center gap-1">
                <span className={tierLimits.collaboration_enabled ? "text-green-500" : "text-red-500"}>
                  {tierLimits.collaboration_enabled ? "✓" : "✗"}
                </span>
                <span>Collaboration</span>
              </li>
              <li className="flex items-center gap-1">
                <span className={tierLimits.chat_enabled ? "text-green-500" : "text-red-500"}>
                  {tierLimits.chat_enabled ? "✓" : "✗"}
                </span>
                <span>AI Study Chat</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
