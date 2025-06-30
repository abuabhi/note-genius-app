import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Gift, Share2, Mail, Heart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSendReferralEmails } from '@/hooks/referrals/useSendReferralEmails';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { useReferralStats } from '@/hooks/referrals/useReferralStats';
import { useSharingUtils } from '@/hooks/referrals/useSharingUtils';

export const SimplifiedReferralForm = () => {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const { sendReferralEmails, isLoading } = useSendReferralEmails();
  
  // Fix: Provide empty object as default argument for hooks that expect parameters
  const { data: referralData } = useReferralData({});
  const { data: statsData } = useReferralStats({});
  const { copyReferralLink, shareReferralLink } = useSharingUtils({});

  // Mock data for demonstration - in real app this would come from the hooks
  const referralCode = referralData?.referralCode || 'PREP2024';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  const totalReferrals = statsData?.totalReferrals || 3;
  const totalEarnings = statsData?.totalEarnings || 45;
  const progressToNextReward = ((totalReferrals % 5) / 5) * 100;

  // Initialize message with referral link
  React.useEffect(() => {
    if (!message) {
      setMessage(`🎓 Join me on PrepGenie - it's amazing for studying! Use my referral link: ${referralLink}`);
    }
  }, [referralLink, message]);

  // Fix: Create proper click handlers that don't expect parameters
  const handleCopyReferralLink = () => {
    copyReferralLink(referralCode);
  };

  const handleShareReferralLink = () => {
    shareReferralLink(referralCode);
  };

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a personal message');
      return;
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);
    
    if (emailList.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    const success = await sendReferralEmails(emailList, message, referralCode);
    
    if (success) {
      setEmails('');
      // Keep the message for future use
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-mint-500 via-mint-600 to-emerald-600"></div>
        <CardHeader className="relative z-10 text-center py-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-white mb-4">
            Invite Friends & Earn Rewards
          </CardTitle>
          <CardDescription className="text-mint-100 text-lg max-w-2xl mx-auto">
            Share PrepGenie with your friends and earn amazing rewards! Every successful referral brings you closer to exclusive prizes.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-white to-mint-50/30 border-mint-100 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-mint-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">{totalReferrals}</CardTitle>
                <CardDescription className="text-gray-600">Friends Referred</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-white to-mint-50/30 border-mint-100 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-mint-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">${totalEarnings}</CardTitle>
                <CardDescription className="text-gray-600">Total Earned</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-white to-mint-50/30 border-mint-100 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-mint-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {5 - (totalReferrals % 5)}
                </CardTitle>
                <CardDescription className="text-gray-600">To Next Reward</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Progress to Next Reward */}
      <Card className="bg-gradient-to-br from-white to-mint-50/30 border-mint-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Progress to Next Reward</CardTitle>
          <CardDescription className="text-gray-600">
            Refer {5 - (totalReferrals % 5)} more friends to unlock your next prize!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressToNextReward} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{totalReferrals % 5} referrals</span>
            <span>5 referrals needed</span>
          </div>
        </CardContent>
      </Card>

      {/* Referral Form */}
      <Card className="bg-gradient-to-br from-white to-mint-50/30 border-mint-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-mint-500/10 to-mint-600/10 border-b border-mint-200/50">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-mint-600" />
            Send Referral Invitations
          </CardTitle>
          <CardDescription className="text-gray-600">
            Invite your friends via email with a personal message
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSendEmails} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="emails" className="text-gray-700 font-medium">
                Email Addresses *
              </Label>
              <Input
                id="emails"
                type="text"
                placeholder="friend1@email.com, friend2@email.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="border-mint-200 focus:border-mint-500 focus:ring-mint-500"
                required
              />
              <p className="text-sm text-gray-500">
                Separate multiple email addresses with commas
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="text-gray-700 font-medium">
                Personal Message *
              </Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to your invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="border-mint-200 focus:border-mint-500 focus:ring-mint-500"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? 'Sending...' : 'Send Invitations'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Share Options */}
      <Card className="bg-gradient-to-br from-white to-mint-50/30 border-mint-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-mint-500/10 to-mint-600/10 border-b border-mint-200/50">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-mint-600" />
            Quick Share Options
          </CardTitle>
          <CardDescription className="text-gray-600">
            Share your referral link instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCopyReferralLink}
                variant="outline"
                className="flex-1 border-mint-200 text-mint-700 hover:bg-mint-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Referral Link
              </Button>
              <Button
                onClick={handleShareReferralLink}
                variant="outline"
                className="flex-1 border-mint-200 text-mint-700 hover:bg-mint-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </div>
            
            <div className="p-4 bg-mint-50/50 rounded-lg border border-mint-200">
              <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
              <code className="text-xs bg-white p-2 rounded border text-mint-700 block break-all">
                {referralLink}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-gradient-to-br from-mint-50 to-mint-100/50 border-mint-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 text-center">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-3">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-md">
                <Share2 className="h-8 w-8 text-mint-600" />
              </div>
              <h3 className="font-semibold text-gray-900">1. Share Your Link</h3>
              <p className="text-sm text-gray-600">
                Send your unique referral link to friends via email or social media
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-md">
                <Users className="h-8 w-8 text-mint-600" />
              </div>
              <h3 className="font-semibold text-gray-900">2. Friends Join</h3>
              <p className="text-sm text-gray-600">
                Your friends sign up using your link and start studying
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-md">
                <Gift className="h-8 w-8 text-mint-600" />
              </div>
              <h3 className="font-semibold text-gray-900">3. Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Get amazing prizes for every successful referral
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
