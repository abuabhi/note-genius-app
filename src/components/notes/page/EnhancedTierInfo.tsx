
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Crown, TrendingUp } from "lucide-react";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";

interface EnhancedTierInfoProps {
  userTier?: UserTier;
  tierLimits?: TierLimits | null;
  notesCount: number;
}

const tierColors = {
  SCHOLAR: "bg-slate-100 text-slate-800 border-slate-200",
  GRADUATE: "bg-blue-100 text-blue-800 border-blue-200", 
  MASTER: "bg-purple-100 text-purple-800 border-purple-200",
  DEAN: "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-200"
};

const tierIcons = {
  SCHOLAR: null,
  GRADUATE: TrendingUp,
  MASTER: Crown,
  DEAN: Crown
};

export const EnhancedTierInfo = ({ userTier, tierLimits, notesCount }: EnhancedTierInfoProps) => {
  if (!userTier || !tierLimits) return null;

  const usagePercentage = tierLimits.max_notes === Infinity 
    ? 0 
    : Math.round((notesCount / tierLimits.max_notes) * 100);
    
  const showTierWarning = tierLimits && notesCount >= tierLimits.max_notes * 0.8;
  const TierIcon = tierIcons[userTier];

  return (
    <div className="mb-8">
      {/* Enhanced Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Your Notes
          </h1>
          <p className="text-gray-600 text-lg">
            Organize, enhance, and study your knowledge
          </p>
        </div>
        
        {/* Tier Status Card */}
        <div className="flex-shrink-0">
          <div className="bg-white rounded-lg border shadow-sm p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className={tierColors[userTier]}>
                  <div className="flex items-center gap-1">
                    {TierIcon && <TierIcon className="h-3 w-3" />}
                    {userTier}
                  </div>
                </Badge>
                {userTier !== 'DEAN' && (
                  <a 
                    href="/pricing" 
                    className="text-xs text-mint-600 hover:text-mint-800 font-medium hover:underline"
                  >
                    Upgrade
                  </a>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Notes Used</span>
                <span className="font-medium text-gray-900">
                  {notesCount.toLocaleString()} / {tierLimits.max_notes === Infinity ? "∞" : tierLimits.max_notes.toLocaleString()}
                </span>
              </div>
              
              {tierLimits.max_notes !== Infinity && (
                <Progress 
                  value={usagePercentage} 
                  className="h-2"
                  indicatorClassName={usagePercentage > 80 ? "bg-red-500" : usagePercentage > 60 ? "bg-yellow-500" : "bg-mint-500"}
                />
              )}
              
              {tierLimits.max_notes !== Infinity && (
                <p className="text-xs text-gray-500">
                  {Math.max(0, tierLimits.max_notes - notesCount).toLocaleString()} notes remaining
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Alert */}
      {showTierWarning && userTier !== 'DEAN' && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Approaching notes limit</AlertTitle>
          <AlertDescription className="text-amber-700">
            You've used {notesCount} of your {tierLimits.max_notes} available notes.
            <a href="/pricing" className="ml-1 font-medium underline hover:no-underline">
              Upgrade your tier
            </a> to continue adding more notes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
