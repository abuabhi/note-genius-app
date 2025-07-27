import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Crown, Zap, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  const TierIcon = tierIcons[userTier];
  const nextTier = nextTierMap[userTier];

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

    return [
      {
        label: "Notes",
        current: 0, // TODO: Get actual usage
        max: tierLimits.max_notes === -1 ? "Unlimited" : tierLimits.max_notes,
        percentage: tierLimits.max_notes === -1 ? 0 : 0, // TODO: Calculate actual percentage
      },
      {
        label: "Flashcard Sets", 
        current: 0, // TODO: Get actual usage
        max: tierLimits.max_flashcard_sets === -1 ? "Unlimited" : tierLimits.max_flashcard_sets,
        percentage: tierLimits.max_flashcard_sets === -1 ? 0 : 0, // TODO: Calculate actual percentage
      },
      {
        label: "Storage",
        current: 0, // TODO: Get actual usage
        max: tierLimits.max_storage_mb === -1 ? "Unlimited" : `${tierLimits.max_storage_mb}MB`,
        percentage: tierLimits.max_storage_mb === -1 ? 0 : 0, // TODO: Calculate actual percentage
      },
    ];
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