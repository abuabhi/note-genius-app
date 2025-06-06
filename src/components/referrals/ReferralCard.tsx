
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, MessageCircle, Trophy, Users, Gift, Loader2 } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';

const ReferralCardContent = () => {
  const { 
    referralStats, 
    contests, 
    contestEntries,
    isLoading,
    joinContest,
    isJoiningContest,
    shareViaWhatsApp,
    copyReferralLink
  } = useReferralData();

  if (isLoading || !referralStats) {
    return (
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-purple-200/50 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/60 rounded-lg p-3 border border-purple-200">
                  <div className="h-5 bg-purple-200/50 rounded w-6 mx-auto mb-2"></div>
                  <div className="h-6 bg-purple-200/50 rounded w-8 mx-auto mb-1"></div>
                  <div className="h-3 bg-purple-200/50 rounded w-12 mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="h-32 bg-white/60 rounded-lg border border-purple-200"></div>
            <div className="h-24 bg-white/60 rounded-lg border border-purple-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeContest = contests[0]; // Get the first active contest
  const userEntry = contestEntries.find(entry => entry.contest_id === activeContest?.id);
  const hasJoinedContest = !!userEntry;
  const isEligibleForPrize = userEntry?.is_eligible || false;

  return (
    <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-purple-800 flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Refer & Win
          </CardTitle>
          {activeContest && (
            <Badge variant="secondary" className="bg-purple-600 text-white">
              <Trophy className="h-3 w-3 mr-1" />
              {activeContest.prize_description}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-white/60 rounded-lg p-3 border border-purple-200">
            <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-bold text-purple-800">{referralStats.completedReferrals}</div>
            <div className="text-xs text-purple-600">Referred</div>
          </div>
          
          <div className="text-center bg-white/60 rounded-lg p-3 border border-purple-200">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-bold text-purple-800">{referralStats.totalPointsEarned}</div>
            <div className="text-xs text-purple-600">Points</div>
          </div>
          
          <div className="text-center bg-white/60 rounded-lg p-3 border border-purple-200">
            <Gift className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold text-purple-800">
              {activeContest ? (userEntry?.referrals_count || 0) : 0}
            </div>
            <div className="text-xs text-purple-600">Contest Entries</div>
          </div>
        </div>

        {/* Contest Status */}
        {activeContest && (
          <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-purple-800">{activeContest.title}</h4>
              {isEligibleForPrize && (
                <Badge className="bg-green-600 text-white">Eligible!</Badge>
              )}
            </div>
            <p className="text-sm text-purple-700 mb-3">{activeContest.description}</p>
            
            {hasJoinedContest ? (
              <div className="text-sm text-purple-600">
                Progress: {userEntry?.referrals_count || 0} / {activeContest.min_referrals_required} referrals
                {!isEligibleForPrize && (
                  <div className="text-xs mt-1">
                    Need {activeContest.min_referrals_required - (userEntry?.referrals_count || 0)} more referrals to be eligible
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => joinContest(activeContest.id)}
                disabled={isJoiningContest}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isJoiningContest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Contest'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Referral Code */}
        <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-700 mb-2">Your referral code:</div>
          <div className="font-mono text-lg font-bold text-purple-800 mb-3">
            {referralStats.referralCode || 'LOADING...'}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyReferralLink(referralStats.referralCode)}
              disabled={!referralStats.referralCode || referralStats.referralCode === 'LOADING...'}
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            
            <Button
              size="sm"
              onClick={() => shareViaWhatsApp(referralStats.referralCode)}
              disabled={!referralStats.referralCode || referralStats.referralCode === 'LOADING...'}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center text-sm text-purple-700">
          <strong>Share with friends and earn rewards!</strong>
          <br />
          Get 100 points for each successful referral 🎯
        </div>
      </CardContent>
    </Card>
  );
};

export const ReferralCard = () => {
  return (
    <Suspense fallback={
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-4" />
            <p className="text-purple-700">Loading referral data...</p>
          </div>
        </CardContent>
      </Card>
    }>
      <ReferralCardContent />
    </Suspense>
  );
};
