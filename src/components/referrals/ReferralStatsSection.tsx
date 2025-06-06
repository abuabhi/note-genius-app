
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Gift, Loader2, Crown, Target } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';

export const ReferralStatsSection = () => {
  const { 
    referralStats, 
    contests, 
    contestEntries,
    isLoading,
  } = useReferralData();

  if (isLoading || !referralStats) {
    return (
      <Card className="border-mint-200 bg-gradient-to-r from-mint-50 to-white">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-mint-200/50 rounded w-64 mx-auto"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 rounded-xl p-6 border border-mint-200">
                  <div className="h-6 bg-mint-200/50 rounded w-8 mx-auto mb-3"></div>
                  <div className="h-8 bg-mint-200/50 rounded w-12 mx-auto mb-2"></div>
                  <div className="h-4 bg-mint-200/50 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeContest = contests[0];
  const userEntry = contestEntries.find(entry => entry.contest_id === activeContest?.id);
  const hasJoinedContest = !!userEntry;
  const isEligibleForPrize = userEntry?.is_eligible || false;

  return (
    <div className="space-y-8">
      <Card className="border-mint-200 bg-gradient-to-r from-mint-50 to-white shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-mint-800 flex items-center justify-center gap-3">
            <Crown className="h-6 w-6 text-yellow-600" />
            Your Referral Kingdom
            <Crown className="h-6 w-6 text-yellow-600" />
          </CardTitle>
          <p className="text-mint-600">Look at you go! Building your study empire one friend at a time! 🏰</p>
        </CardHeader>
        
        <CardContent className="pb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white/80 rounded-xl p-6 border border-mint-200 shadow-sm">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-mint-600" />
              </div>
              <div className="text-3xl font-bold text-mint-800 mb-1">{referralStats.completedReferrals}</div>
              <div className="text-sm text-mint-600 font-medium">Friends Recruited</div>
              <div className="text-xs text-mint-500 mt-1">You're a natural! 🌟</div>
            </div>
            
            <div className="text-center bg-white/80 rounded-xl p-6 border border-mint-200 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-mint-800 mb-1">{referralStats.totalPointsEarned}</div>
              <div className="text-sm text-mint-600 font-medium">Points Earned</div>
              <div className="text-xs text-mint-500 mt-1">Cha-ching! 💰</div>
            </div>
            
            <div className="text-center bg-white/80 rounded-xl p-6 border border-mint-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-mint-800 mb-1">
                {activeContest ? (userEntry?.referrals_count || 0) : 0}
              </div>
              <div className="text-sm text-mint-600 font-medium">Contest Progress</div>
              <div className="text-xs text-mint-500 mt-1">Keep going! 🎯</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contest Section */}
      {activeContest && (
        <Card className="border-mint-200 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-orange-800 flex items-center gap-2">
                <Gift className="h-5 w-5" />
                🔥 {activeContest.title}
              </CardTitle>
              {isEligibleForPrize && (
                <Badge className="bg-green-600 text-white animate-pulse">
                  🏆 You're Eligible!
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-orange-700 mb-4 text-lg">{activeContest.description}</p>
            
            {hasJoinedContest ? (
              <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-orange-800">Your Progress:</span>
                  <span className="text-lg font-bold text-orange-800">
                    {userEntry?.referrals_count || 0} / {activeContest.min_referrals_required}
                  </span>
                </div>
                
                <div className="w-full bg-orange-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(((userEntry?.referrals_count || 0) / activeContest.min_referrals_required) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                {!isEligibleForPrize && (
                  <p className="text-sm text-orange-600">
                    🎯 Just {activeContest.min_referrals_required - (userEntry?.referrals_count || 0)} more referrals to win!
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-orange-600 mb-4">🚀 Ready to compete for amazing prizes?</p>
                <p className="text-sm text-orange-500">Join the contest to start tracking your progress!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
