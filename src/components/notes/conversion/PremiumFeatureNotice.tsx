
import { UserTier } from "@/hooks/useRequireAuth";

interface PremiumFeatureNoticeProps {
  isPremium: boolean;
}

export const PremiumFeatureNotice = ({ isPremium }: PremiumFeatureNoticeProps) => {
  if (isPremium) return null;
  
  return (
    <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
      <p className="font-medium">Premium Feature</p>
      <p>Upgrade to Professor or Dean tier for AI-assisted content extraction and improved flashcard generation.</p>
    </div>
  );
};
