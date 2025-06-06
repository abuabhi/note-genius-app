
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Target, Loader2, AlertCircle } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';

export const ReferralStatsSection = () => {
  const { 
    referralStats, 
    contests, 
    contestEntries,
    isLoading,
    hasError
  } = useReferralData();

  if (hasError) {
    return (
      <Card className="border-red-200 bg-red-50 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-red-700 font-medium">Unable to load referral stats</p>
              <p className="text-red-600 text-sm">Please try refreshing the page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !referralStats) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
            <span className="ml-2 text-gray-600">Loading your referral stats...</span>
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
    <div className="space-y-6">
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 text-center">
            Your Referral Progress
          </CardTitle>
          <p className="text-gray-600 text-center">Track your success and see your impact</p>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-mint-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-mint-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{referralStats.completedReferrals}</div>
              <div className="text-sm text-gray-600 font-medium">Successful Referrals</div>
            </div>
            
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{referralStats.totalPointsEarned}</div>
              <div className="text-sm text-gray-600 font-medium">Points Earned</div>
            </div>
            
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {activeContest ? (userEntry?.referrals_count || 0) : 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">Contest Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeContest && (
        <Card className="border-orange-200 bg-orange-50/30 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-orange-900">
                Active Contest: {activeContest.title}
              </CardTitle>
              {isEligibleForPrize && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Eligible for Prize
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-orange-800 mb-4">{activeContest.description}</p>
            
            {hasJoinedContest ? (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-orange-900">Progress:</span>
                  <span className="text-lg font-bold text-orange-900">
                    {userEntry?.referrals_count || 0} / {activeContest.min_referrals_required}
                  </span>
                </div>
                
                <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(((userEntry?.referrals_count || 0) / activeContest.min_referrals_required) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                {!isEligibleForPrize && (
                  <p className="text-sm text-orange-700">
                    {activeContest.min_referrals_required - (userEntry?.referrals_count || 0)} more referrals needed to win
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-orange-700">Join this contest to start competing for amazing prizes!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
