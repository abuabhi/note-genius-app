
import { Card, CardContent } from '@/components/ui/card';
import { Users, Trophy, Target } from 'lucide-react';

export const ReferralHeroSection = () => {
  return (
    <div className="text-center space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Refer Friends, Earn Rewards
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-8">
          Share StudyBuddy with your friends and unlock exclusive rewards. 
          Help others succeed in their studies while earning amazing benefits for yourself.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-mint-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-mint-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share with Friends</h3>
            <p className="text-gray-600">
              Invite your study partners and classmates to join our learning community.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn Rewards</h3>
            <p className="text-gray-600">
              Get premium features, exclusive content, and special recognition for every successful referral.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your referral milestones and see how close you are to unlocking the next reward.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
