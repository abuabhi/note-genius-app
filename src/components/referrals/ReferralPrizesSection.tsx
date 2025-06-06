
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Gift, Star, Zap, Award, Sparkles } from 'lucide-react';

export const ReferralPrizesSection = () => {
  const prizes = [
    {
      referrals: 1,
      title: "Welcome Gift! 🎁",
      description: "100 bonus points to kick off your journey",
      icon: Gift,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      referrals: 3,
      title: "Study Warrior 🗡️",
      description: "Premium features for 1 month + exclusive badge",
      icon: Award,
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      referrals: 5,
      title: "Knowledge Champion 🏆",
      description: "3 months premium + StudyBuddy merchandise",
      icon: Star,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      referrals: 10,
      title: "Study Superhero 🦸‍♀️",
      description: "6 months premium + personalized study plan",
      icon: Zap,
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      referrals: 25,
      title: "StudyBuddy Legend 👑",
      description: "Lifetime premium + exclusive merchandise + Hall of Fame",
      icon: Crown,
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    }
  ];

  return (
    <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-mint-800 flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          Epic Rewards Await! 
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </CardTitle>
        <p className="text-lg text-mint-600 max-w-2xl mx-auto">
          Every referral gets you closer to legendary status! Here's what you can win (spoiler: it's awesome!) 🚀
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {prizes.map((prize, index) => {
            const IconComponent = prize.icon;
            return (
              <div key={index} className={`${prize.bgColor} rounded-xl p-6 ${prize.borderColor} border-2 hover:shadow-lg transition-all group`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${prize.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-sm font-bold">
                        {prize.referrals} Referral{prize.referrals > 1 ? 's' : ''}
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-800">{prize.title}</h3>
                    </div>
                    <p className="text-gray-600 text-lg">{prize.description}</p>
                  </div>
                  
                  <div className="text-4xl animate-pulse">
                    {index === 0 && "🎁"}
                    {index === 1 && "🗡️"}
                    {index === 2 && "🏆"}
                    {index === 3 && "🦸‍♀️"}
                    {index === 4 && "👑"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border-2 border-yellow-300">
          <div className="text-center">
            <div className="text-4xl mb-3">🎊</div>
            <h3 className="text-xl font-bold text-orange-800 mb-2">But Wait, There's More!</h3>
            <p className="text-orange-700">
              Special seasonal contests, surprise bonuses, and exclusive events throughout the year! 
              Plus, every referral gets you points that never expire. It's like a study savings account! 💰
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-mint-600 italic">
            * All prizes are cumulative - once you earn them, they're yours forever! 
            No take-backs, no funny business. We're the good guys! 😇
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
