
import { UserTier } from "@/hooks/useRequireAuth";

export interface InfluencerMetadata {
  instagram?: {
    handle: string;
    followers: number;
  };
  tiktok?: {
    handle: string;
    followers: number;
  };
  youtube?: {
    handle: string;
    subscribers: number;
  };
  twitter?: {
    handle: string;
    followers: number;
  };
  linkedin?: {
    handle: string;
    connections: number;
  };
  couponPercentage?: number;
  [key: string]: any; // Allow for JSON compatibility
}

export interface User {
  id: string;
  email: string;
  username?: string;
  user_tier: UserTier;
  created_at: string;
  onboarding_completed?: boolean;
  is_influencer?: boolean;
  influencer_tier?: string;
  influencer_metadata?: InfluencerMetadata;
  influencer_promoted_at?: string;
  influencer_promoted_by?: string;
  influencer_expires_at?: string;
  influencer_notes?: string;
  influencer_coupon_percentage?: number;
}
