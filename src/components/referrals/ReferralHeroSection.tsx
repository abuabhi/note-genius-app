
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Sparkles } from 'lucide-react';

export const ReferralHeroSection = () => {
  return (
    <div className="text-center space-y-8">
      <div className="relative">
        <div className="absolute -top-4 -right-4 text-6xl animate-bounce">🎉</div>
        <div className="absolute -top-2 -left-6 text-4xl animate-pulse">⚡</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-mint-600 to-mint-800 bg-clip-text text-transparent mb-4">
          Refer Friends, Win Big! 🚀
        </h1>
        <p className="text-xl text-mint-700 max-w-3xl mx-auto leading-relaxed">
          Turn your study sessions into a treasure hunt! Every friend you bring joins our amazing community, 
          and you get epic rewards. It's like being a study superhero! 🦸‍♀️
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-mint-600" />
            </div>
            <h3 className="text-lg font-semibold text-mint-800 mb-2">Share the Love</h3>
            <p className="text-mint-600">
              Spread the StudyBuddy magic! Your friends get an awesome study platform, you get rewards. Win-win! 🤝
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-mint-800 mb-2">Earn Epic Rewards</h3>
            <p className="text-mint-600">
              From premium features to exclusive merch, every referral brings you closer to study stardom! ⭐
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-mint-800 mb-2">Build Your Squad</h3>
            <p className="text-mint-600">
              Create your study empire! The more friends you refer, the bigger your bragging rights! 👑
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
