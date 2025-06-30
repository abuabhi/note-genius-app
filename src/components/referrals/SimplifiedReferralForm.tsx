
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Share2, 
  Mail, 
  Copy, 
  Users, 
  Trophy, 
  Target,
  Loader2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { useSendReferralEmails } from '@/hooks/referrals/useSendReferralEmails';
import { ReferralPrizesSection } from './ReferralPrizesSection';

export const SimplifiedReferralForm = () => {
  const {
    referralStats,
    isLoading: dataLoading,
    hasError,
    generateReferralLink,
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter
  } = useReferralData();

  const { sendReferralEmails, isLoading: emailLoading } = useSendReferralEmails();

  // Form state
  const [emails, setEmails] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const referralLink = generateReferralLink(referralStats?.referralCode || '');

  // Default message with actual referral link
  const defaultMessage = `Hey! I found this amazing study tool that has really helped me with my learning. Check it out and join me: ${referralLink}

StudyBuddy helps you organize notes, create flashcards, and track your progress. Plus, when you sign up with my link, we both get rewarded!

Let me know what you think!`;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);
    
    if (emailList.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    const messageToSend = customMessage.trim() || defaultMessage;
    
    const success = await sendReferralEmails(emailList, messageToSend, referralStats?.referralCode || '');
    
    if (success) {
      setEmails('');
      setCustomMessage('');
    }
  };

  const handleCopyLink = async () => {
    await copyReferralLink(referralStats?.referralCode || '');
  };

  const handleShareLinkedIn = () => {
    shareViaLinkedIn(referralStats?.referralCode || '');
  };

  const handleShareTwitter = () => {
    shareViaTwitter(referralStats?.referralCode || '');
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
        <span className="ml-2 text-gray-600">Loading referral data...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load referral data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold text-mint-600">{referralStats?.totalReferrals || 0}</p>
              </div>
              <Users className="h-8 w-8 text-mint-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{referralStats?.completedReferrals || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="text-3xl font-bold text-yellow-600">{referralStats?.totalPointsEarned || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-mint-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Progress to next reward</span>
            <span className="text-sm font-medium">{referralStats?.totalReferrals || 0}/5 referrals</span>
          </div>
          <Progress 
            value={((referralStats?.totalReferrals || 0) / 5) * 100} 
            className="h-3" 
          />
          <p className="text-sm text-gray-500">
            {5 - (referralStats?.totalReferrals || 0)} more referrals needed for your next reward!
          </p>
        </CardContent>
      </Card>

      {/* Rewards Section */}
      <ReferralPrizesSection />

      {/* Referral Link Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-mint-600" />
            Share Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Input 
              value={referralLink}
              readOnly 
              className="flex-1 bg-white border-gray-200"
            />
            <Button 
              onClick={handleCopyLink}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleShareLinkedIn}
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button 
              onClick={handleShareTwitter}
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Twitter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Invitation Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-mint-600" />
            Send Email Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="emails">Email Addresses</Label>
              <Input
                id="emails"
                type="text"
                placeholder="friend1@example.com, friend2@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>

            <div>
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder={defaultMessage}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank to use the default message with your referral link
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={emailLoading}
              className="w-full bg-mint-600 hover:bg-mint-700"
            >
              {emailLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Invitations...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitations
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
