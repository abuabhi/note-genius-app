
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Award, Crown, Trophy } from 'lucide-react';

export const ReferralPrizesSection = () => {
  const prizes = [
    {
      referrals: 1,
      title: "First Referral Bonus",
      description: "100 bonus points to get you started",
      icon: Gift,
      color: "bg-green-100 text-green-700",
      borderColor: "border-green-200"
    },
    {
      referrals: 3,
      title: "Study Achiever",
      description: "Premium features for 1 month + exclusive badge",
      icon: Award,
      color: "bg-blue-100 text-blue-700",
      borderColor: "border-blue-200"
    },
    {
      referrals: 5,
      title: "Knowledge Advocate",
      description: "3 months premium + StudyBuddy merchandise",
      icon: Star,
      color: "bg-purple-100 text-purple-700",
      borderColor: "border-purple-200"
    },
    {
      referrals: 10,
      title: "Study Champion",
      description: "6 months premium + personalized study plan",
      icon: Trophy,
      color: "bg-orange-100 text-orange-700",
      borderColor: "border-orange-200"
    },
    {
      referrals: 25,
      title: "StudyBuddy Ambassador",
      description: "Lifetime premium + exclusive merchandise + Hall of Fame",
      icon: Crown,
      color: "bg-yellow-100 text-yellow-700",
      borderColor: "border-yellow-200"
    }
  ];

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-gray-900">
          Reward Milestones
        </CardTitle>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Every referral brings you closer to amazing rewards. Here's what you can earn:
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {prizes.map((prize, index) => {
          const IconComponent = prize.icon;
          return (
            <div key={index} className={`bg-gray-50 rounded-xl p-6 ${prize.borderColor} border hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${prize.color} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-sm font-medium border-gray-300">
                      {prize.referrals} Referral{prize.referrals > 1 ? 's' : ''}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900">{prize.title}</h3>
                  </div>
                  <p className="text-gray-600">{prize.description}</p>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="bg-gradient-to-r from-mint-50 to-blue-50 rounded-xl p-6 border border-mint-200 mt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Benefits</h3>
            <p className="text-gray-700">
              Seasonal contests, surprise bonuses, and exclusive events throughout the year. 
              Plus, referral points never expire - they're yours to keep forever.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 italic">
            All rewards are cumulative and yours to keep. Terms and conditions apply.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
