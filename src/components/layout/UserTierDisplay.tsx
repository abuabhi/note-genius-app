
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUserTier } from "@/hooks/useUserTier";
import { UserTier } from "@/hooks/useRequireAuth";

const tierColors = {
  [UserTier.SCHOLAR]: "bg-blue-500",
  [UserTier.GRADUATE]: "bg-green-500",
  [UserTier.MASTER]: "bg-purple-500",
  [UserTier.DEAN]: "bg-amber-500",
};

const tierBadgeVariants = {
  [UserTier.SCHOLAR]: "info",
  [UserTier.GRADUATE]: "success",
  [UserTier.MASTER]: "secondary",
  [UserTier.DEAN]: "warning",
};

export function UserTierDisplay() {
  const { userTier, isLoading, tierLimits } = useUserTier();
  
  if (isLoading || !userTier) {
    return (
      <div className="px-2 py-3 space-y-2">
        <div className="h-5 bg-gray-200 animate-pulse rounded" />
        <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="px-2 py-2 space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant={tierBadgeVariants[userTier] as any}>
          {userTier}
        </Badge>
      </div>
      
      {tierLimits && (
        <div className="space-y-2 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Notes</span>
              <span className="text-xs font-medium">
                {tierLimits?.max_notes === Infinity ? "Unlimited" : tierLimits?.max_notes}
              </span>
            </div>
            <Progress 
              value={tierLimits?.max_notes === Infinity ? 100 : 50} 
              className="h-1"
              indicatorClassName={tierColors[userTier]} 
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Storage</span>
              <span className="text-xs font-medium">
                {tierLimits?.max_storage_mb === Infinity 
                  ? "Unlimited" 
                  : `${tierLimits?.max_storage_mb} MB`}
              </span>
            </div>
            <Progress 
              value={tierLimits?.max_storage_mb === Infinity ? 100 : 40} 
              className="h-1"
              indicatorClassName={tierColors[userTier]} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
