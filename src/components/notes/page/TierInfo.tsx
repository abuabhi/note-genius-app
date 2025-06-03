
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";

interface TierInfoProps {
  userTier?: UserTier;
  tierLimits?: TierLimits | null;
  notesCount: number;
}

export const TierInfo = ({ userTier, tierLimits, notesCount }: TierInfoProps) => {
  if (!userTier || !tierLimits) return null;

  // This is now a simplified fallback component
  // The main visual hierarchy is handled by EnhancedTierInfo
  const showTierWarning = tierLimits && notesCount >= tierLimits.max_notes * 0.8;

  if (!showTierWarning || userTier === 'DEAN') {
    return null;
  }

  return (
    <Alert className="mb-4 border-mint-300 bg-mint-50">
      <AlertCircle className="h-4 w-4 text-mint-600" />
      <AlertTitle className="text-mint-800">You're approaching your notes limit</AlertTitle>
      <AlertDescription className="text-mint-700">
        You've used {notesCount} of your {tierLimits.max_notes} available notes.
        Consider upgrading your tier to continue adding more notes.
      </AlertDescription>
    </Alert>
  );
};
