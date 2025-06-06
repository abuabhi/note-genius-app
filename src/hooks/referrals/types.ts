
export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  referralCode: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  prize_description: string;
  start_date: string;
  end_date: string;
  min_referrals_required: number;
  is_active: boolean;
}

export interface ContestEntry {
  id: string;
  contest_id: string;
  referrals_count: number;
  is_eligible: boolean;
  contest: Contest;
}
