
import { UserTier } from "@/hooks/useRequireAuth";

export interface User {
  id: string;
  email: string;
  username?: string;
  user_tier: UserTier;
  created_at: string;
  onboarding_completed?: boolean;
}
