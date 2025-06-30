import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Gift, Users, Award, Share2, Mail, Copy, CheckCircle } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { useSendReferralEmails } from '@/hooks/referrals/useSendReferralEmails';
import { toast } from 'sonner';

export const SimplifiedReferralForm = () => {
  const { 
    referralStats, 
    generateReferralLink, 
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter,
    isLoading 
  } = useReferralData();
  
  const { sendReferralEmails, isLoading: isSendingEmails } = useSendReferralEmails();
  
  const [emails, setEmails] = useState('');
  const [personalMessage, setPersonalMessage] = useState(
    `Hi! I've been using PrepGenie to supercharge my studying and thought you'd love it too! 🎓\n\nJoin me using my referral link: ${generateReferralLink()}\n\nYou'll get access to AI-powered flashcards, smart note-taking, and personalized study plans. Let's crush our academic goals together!`
  );
  const [emailsSent, setEmailsSent] = useState(false);

  const handleSendEmails = async () => {
    if (!emails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }
    
    if (!personalMessage.trim()) {
      toast.error('Please enter a personal message');
      return;
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    const success = await sendReferralEmails(emailList, personalMessage, referralStats?.referralCode || '');
    
    if (success) {
      setEmailsSent(true);
      setEmails('');
      // Keep the message for potential future sends
    }
  };

  const handleCopyReferralLink = () => {
    copyReferralLink();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <Card className="overflow-hidden shadow-lg border-0">
        <div className="bg-gradient-to-r from-mint-600 to-blue-600 text-white p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Gift className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">Invite Friends & Earn Rewards</h1>
          </div>
          <p className="text-mint-100 text-lg">
            Share PrepGenie with friends and earn points for every successful referral! 
            Help others succeed while boosting your own learning journey.
          </p>
        </div>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-mint-50/30 shadow-sm border border-mint-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mint-100 rounded-lg">
                <Users className="h-5 w-5 text-mint-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-mint-700">{referralStats?.totalReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-blue-50/30 shadow-sm border border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-700">{referralStats?.completedReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-amber-50/30 shadow-sm border border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="text-2xl font-bold text-amber-700">{referralStats?.totalPointsEarned || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50/30 shadow-sm border border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Referral Code</p>
                <p className="text-lg font-bold text-purple-700 font-mono">{referralStats?.referralCode || 'LOADING'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Form */}
      <Card className="shadow-lg border border-mint-100">
        <CardHeader className="bg-gradient-to-r from-mint-50 to-blue-50 border-b border-mint-100">
          <CardTitle className="flex items-center gap-2 text-mint-800">
            <Mail className="h-5 w-5" />
            Send Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emails" className="text-sm font-medium text-gray-700">
              Email Addresses <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emails"
              type="text"
              placeholder="friend1@email.com, friend2@email.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="focus:ring-mint-500 focus:border-mint-500"
              disabled={isSendingEmails}
            />
            <p className="text-xs text-gray-500">
              Separate multiple email addresses with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Personal Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Add a personal touch to your invitation..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={6}
              className="focus:ring-mint-500 focus:border-mint-500"
              disabled={isSendingEmails}
            />
            <p className="text-xs text-gray-500">
              Your referral link is already included in the message above
            </p>
          </div>

          <Button 
            onClick={handleSendEmails}
            disabled={isSendingEmails || !emails.trim() || !personalMessage.trim()}
            className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800"
          >
            {isSendingEmails ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Invitations...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitations
              </>
            )}
          </Button>

          {emailsSent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Invitations sent successfully!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card className="shadow-lg border border-mint-100">
        <CardHeader className="bg-gradient-to-r from-mint-50 to-blue-50 border-b border-mint-100">
          <CardTitle className="flex items-center gap-2 text-mint-800">
            <Share2 className="h-5 w-5" />
            Share Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <Input
              value={generateReferralLink()}
              readOnly
              className="font-mono text-sm bg-gray-50"
            />
            <Button
              onClick={handleCopyReferralLink}
              variant="outline"
              className="border-mint-300 text-mint-700 hover:bg-mint-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Referral Link
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={shareViaTwitter}
              variant="outline"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Share on Twitter
            </Button>
            <Button
              onClick={shareViaLinkedIn}
              variant="outline"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Share on LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="shadow-lg border border-mint-100">
        <CardHeader className="bg-gradient-to-r from-mint-50 to-blue-50 border-b border-mint-100">
          <CardTitle className="text-mint-800">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                <span className="text-mint-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-mint-800">Share Your Link</h3>
              <p className="text-sm text-gray-600">
                Send your unique referral link to friends via email or social media
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                <span className="text-mint-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-mint-800">Friends Sign Up</h3>
              <p className="text-sm text-gray-600">
                When they create an account using your link, you both get rewarded
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                <span className="text-mint-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-mint-800">Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Get points and unlock premium features as your network grows
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
