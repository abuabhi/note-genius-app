
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Gift, Copy, Send, Users, Trophy, Sparkles, Linkedin } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { toast } from 'sonner';

export const SimplifiedReferralForm = () => {
  const { 
    referralStats, 
    isLoading,
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter
  } = useReferralData();

  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('Hi! I found this amazing study platform called PrepGenie that has really helped improve my learning. Check it out!');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmails = async () => {
    if (!emails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    
    if (emailList.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    if (emailList.length > 5) {
      toast.error('You can send to a maximum of 5 friends at once');
      return;
    }

    setIsSending(true);
    try {
      // Here you would call your email sending function
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(`Invitations sent to ${emailList.length} friend${emailList.length > 1 ? 's' : ''}! 🎉`);
      setEmails('');
    } catch (error) {
      toast.error('Failed to send invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || !referralStats) {
    return (
      <Card className="shadow-xl border-mint-100">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-mint-200/50 rounded w-64 mx-auto"></div>
            <div className="h-32 bg-mint-100/50 rounded"></div>
            <div className="h-24 bg-mint-100/50 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = Math.min((referralStats.completedReferrals / 5) * 100, 100);
  const nextMilestone = referralStats.completedReferrals < 5 ? 5 : 10;
  const referralsNeeded = nextMilestone - referralStats.completedReferrals;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Gift className="h-8 w-8 text-mint-600" />
          Invite Friends & Earn Rewards
        </h1>
        <p className="text-xl text-gray-600">
          Share PrepGenie with friends and earn points for every successful referral
        </p>
      </div>

      {/* Main Referral Card */}
      <Card className="shadow-xl border-mint-100 bg-gradient-to-br from-white to-mint-50/30">
        <CardHeader className="bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-white text-xl">
            <Sparkles className="h-6 w-6" />
            Your Referral Dashboard
          </CardTitle>
          <CardDescription className="text-mint-50">
            Track your progress and share with friends to earn rewards
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-lg p-4 border border-mint-200 shadow-sm">
              <Users className="h-8 w-8 mx-auto mb-2 text-mint-600" />
              <div className="text-2xl font-bold text-mint-800">{referralStats.completedReferrals}</div>
              <div className="text-sm text-mint-600">Friends Referred</div>
            </div>
            
            <div className="text-center bg-white rounded-lg p-4 border border-mint-200 shadow-sm">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-mint-800">{referralStats.totalPointsEarned}</div>
              <div className="text-sm text-mint-600">Points Earned</div>
            </div>
            
            <div className="text-center bg-white rounded-lg p-4 border border-mint-200 shadow-sm">
              <Gift className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-mint-800">{referralsNeeded > 0 ? referralsNeeded : '🎉'}</div>
              <div className="text-sm text-mint-600">
                {referralsNeeded > 0 ? 'To Next Reward' : 'Milestone Reached!'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-6 border border-mint-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-mint-800">Progress to Next Milestone</h3>
              <span className="text-sm text-mint-600">{referralStats.completedReferrals}/{nextMilestone}</span>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <p className="text-sm text-mint-700">
              {referralsNeeded > 0 
                ? `${referralsNeeded} more referral${referralsNeeded > 1 ? 's' : ''} to unlock your next reward!`
                : 'Congratulations! You\'ve reached a milestone! 🎉'
              }
            </p>
          </div>

          {/* Referral Code */}
          <div className="bg-white rounded-lg p-6 border border-mint-200">
            <Label className="text-mint-800 font-medium mb-3 block">Your Referral Code</Label>
            <div className="flex gap-3">
              <Input
                value={referralStats.referralCode}
                readOnly
                className="font-mono text-lg text-center bg-mint-50 border-mint-300"
              />
              <Button
                onClick={() => copyReferralLink(referralStats.referralCode)}
                className="bg-mint-600 hover:bg-mint-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Email Friends */}
          <div className="bg-white rounded-lg p-6 border border-mint-200">
            <Label className="text-mint-800 font-medium mb-3 block">Invite Friends by Email</Label>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Enter email addresses (comma separated, max 5)"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="border-mint-300 focus:border-mint-500"
                />
                <p className="text-xs text-mint-600 mt-1">
                  Example: friend1@email.com, friend2@email.com
                </p>
              </div>
              
              <div>
                <Label className="text-mint-700 text-sm mb-2 block">Personal Message (Optional)</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-20 border-mint-300 focus:border-mint-500"
                  maxLength={300}
                />
                <p className="text-xs text-mint-600 mt-1">
                  {message.length}/300 characters
                </p>
              </div>

              <Button
                onClick={handleSendEmails}
                disabled={isSending || !emails.trim()}
                className="w-full bg-mint-600 hover:bg-mint-700 text-white py-3"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending Invitations...' : 'Send Invitations'}
              </Button>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="bg-white rounded-lg p-6 border border-mint-200">
            <Label className="text-mint-800 font-medium mb-4 block">Share on Social Media</Label>
            <div className="flex gap-3">
              <Button
                onClick={() => shareViaLinkedIn(referralStats.referralCode)}
                variant="outline"
                className="flex-1 border-mint-300 text-mint-700 hover:bg-mint-50"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              
              <Button
                onClick={() => shareViaTwitter(referralStats.referralCode)}
                variant="outline"
                className="flex-1 border-mint-300 text-mint-700 hover:bg-mint-50"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-mint-50 to-mint-100 rounded-lg p-6 border border-mint-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-mint-500 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-mint-800 mb-2">How It Works</h3>
            <p className="text-mint-700 text-sm leading-relaxed">
              Share your unique referral code with friends. When they sign up and start using PrepGenie, 
              you'll earn 100 points for each successful referral. Reach milestones to unlock special rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
