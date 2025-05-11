
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

  // Display tier limit warning if user is approaching their limit
  const showTierWarning = tierLimits && notesCount >= tierLimits.max_notes * 0.8;

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-mint-800">Your Notes</h2>
          <p className="text-muted-foreground">
            <span className="font-medium">{userTier}</span> tier · {notesCount} of {tierLimits.max_notes} notes used
          </p>
        </div>
        {userTier !== 'DEAN' && (
          <a 
            href="/pricing" 
            className="mt-2 sm:mt-0 text-sm text-mint-600 hover:text-mint-800 font-medium"
          >
            Upgrade tier
          </a>
        )}
      </div>

      {showTierWarning && userTier !== 'DEAN' && (
        <Alert className="mb-4 border-mint-300 bg-mint-50">
          <AlertCircle className="h-4 w-4 text-mint-600" />
          <AlertTitle className="text-mint-800">You're approaching your notes limit</AlertTitle>
          <AlertDescription className="text-mint-700">
            You've used {notesCount} of your {tierLimits.max_notes} available notes.
            Consider upgrading your tier to continue adding more notes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
