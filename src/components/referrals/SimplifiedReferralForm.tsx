
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Gift, Users, Copy, Share2, Trophy, Target, Zap, Heart } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { useSendReferralEmails } from '@/hooks/referrals/useSendReferralEmails';
import { toast } from 'sonner';

export const SimplifiedReferralForm = () => {
  // Get referral data using the correct hook API
  const {
    referralStats,
    contests,
    contestEntries,
    isLoading,
    hasError,
    joinContest,
    isJoiningContest,
    generateReferralLink,
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter
  } = useReferralData();

  const { sendReferralEmails, isLoading: isEmailLoading } = useSendReferralEmails();

  // Local state for form
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('Hey! I found this amazing study tool that has really helped me with my learning. Check it out and join me!');
  const [includePersonalNote, setIncludePersonalNote] = useState(true);

  // Calculate total points earned (use totalPointsEarned from ReferralStats)
  const totalEarnings = referralStats?.totalPointsEarned || 0;
  const progressPercentage = Math.min((referralStats?.totalReferrals || 0) * 20, 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    const finalMessage = includePersonalNote ? message : 'Check out this amazing study tool!';
    
    const success = await sendReferralEmails(emailList, finalMessage, referralStats?.referralCode || '');
    
    if (success) {
      setEmails('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Failed to load referral data. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-mint-600 to-mint-700 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Invite Friends & Earn Rewards</h1>
                <p className="text-mint-100 mt-2">Share the learning experience and get rewarded together!</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-white to-mint-50/30 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-mint-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-mint-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats?.totalReferrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-mint-50/30 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats?.completedReferrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-mint-50/30 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats?.pendingReferrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-mint-50/30 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Points Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-br from-white to-mint-50/30 border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-mint-500/10 to-mint-600/10 border-b border-mint-200/50">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-mint-600" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Referral Progress</span>
                <span className="text-sm text-gray-500">{referralStats?.totalReferrals || 0}/5 referrals</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-gray-600">
                Keep going! Each successful referral earns you points and brings exclusive rewards closer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referral Form Card */}
        <Card className="bg-gradient-to-br from-white to-mint-50/30 border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-mint-500/10 to-mint-600/10 border-b border-mint-200/50">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-mint-600" />
              Send Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emails" className="text-gray-700 font-medium">
                  Email Addresses (comma-separated)
                </Label>
                <Input
                  id="emails"
                  type="text"
                  placeholder="friend1@example.com, friend2@example.com"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter multiple email addresses separated by commas
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="personal-note"
                  checked={includePersonalNote}
                  onCheckedChange={setIncludePersonalNote}
                />
                <Label htmlFor="personal-note" className="text-gray-700">
                  Include personal note
                </Label>
              </div>

              {includePersonalNote && (
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700 font-medium">
                    Personal Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal touch to your invitation..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px] focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isEmailLoading}
                className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isEmailLoading ? 'Sending...' : 'Send Invitations'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Share Options */}
        <Card className="bg-gradient-to-br from-white to-mint-50/30 border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-mint-500/10 to-mint-600/10 border-b border-mint-200/50">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Gift className="h-5 w-5 text-mint-600" />
              Quick Share
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <code className="flex-1 text-sm font-mono text-gray-700">
                  {generateReferralLink(referralStats?.referralCode || '')}
                </code>
                <Button
                  onClick={() => copyReferralLink(referralStats?.referralCode || '')}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-mint-200 text-mint-700 hover:bg-mint-50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => shareViaLinkedIn(referralStats?.referralCode || '')}
                  variant="outline"
                  className="flex-1 border-mint-200 text-mint-700 hover:bg-mint-50"
                >
                  Share on LinkedIn
                </Button>
                <Button
                  onClick={() => shareViaTwitter(referralStats?.referralCode || '')}
                  variant="outline"
                  className="flex-1 border-mint-200 text-mint-700 hover:bg-mint-50"
                >
                  Share on Twitter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-gradient-to-br from-mint-50/50 to-mint-100/30 border-mint-200/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Zap className="h-5 w-5 text-mint-600" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto">
                  <Share2 className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="font-semibold text-gray-800">1. Share Your Link</h3>
                <p className="text-sm text-gray-600">Send your unique referral link to friends via email or social media</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="font-semibold text-gray-800">2. Friends Join</h3>
                <p className="text-sm text-gray-600">Your friends sign up using your referral link and start learning</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="font-semibold text-gray-800">3. Earn Rewards</h3>
                <p className="text-sm text-gray-600">Get points and unlock exclusive rewards as your friends engage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
