import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Gift, Users, Share2, Trophy, Mail, Copy, Plus, X, Loader2 } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { useSendReferralEmails } from '@/hooks/referrals/useSendReferralEmails';
import { toast } from 'sonner';

export const SimplifiedReferralForm = () => {
  const { referralStats, isLoading } = useReferralData();
  const { sendReferralEmails, isLoading: isSendingEmails } = useSendReferralEmails();
  const [emails, setEmails] = useState(['']);
  const [personalMessage, setPersonalMessage] = useState('');

  // Pre-populate the personal message with referral link
  useEffect(() => {
    if (referralStats?.referralCode && !personalMessage) {
      const referralLink = `${window.location.origin}?ref=${referralStats.referralCode}`;
      const defaultMessage = `Hi! I've been using PrepGenie to supercharge my studying and it's been amazing! 🎓

It's an AI-powered study platform that helps with:
✅ Smart flashcard generation
✅ Intelligent note organization  
✅ Progress tracking & analytics
✅ Collaborative study features

I think you'd love it too! Join using my referral link and we both get bonus features:

${referralLink}

Happy studying! 📚`;
      
      setPersonalMessage(defaultMessage);
    }
  }, [referralStats?.referralCode, personalMessage]);

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const copyReferralLink = async () => {
    if (!referralStats?.referralCode) return;
    
    const referralLink = `${window.location.origin}?ref=${referralStats.referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard! 🎉');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const validateEmails = (emailList: string[]) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emailList.filter(email => email.trim() && emailRegex.test(email.trim()));
    return validEmails;
  };

  const handleSendEmails = async () => {
    if (!referralStats?.referralCode) {
      toast.error('Referral code not available. Please try again.');
      return;
    }

    if (!personalMessage.trim()) {
      toast.error('Please enter a personal message');
      return;
    }

    const validEmails = validateEmails(emails);
    
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    const invalidCount = emails.filter(email => email.trim()).length - validEmails.length;
    if (invalidCount > 0) {
      toast.error(`${invalidCount} email address${invalidCount > 1 ? 'es are' : ' is'} invalid. Please fix them.`);
      return;
    }

    const success = await sendReferralEmails(validEmails, personalMessage, referralStats.referralCode);
    
    if (success) {
      // Reset form after successful sending
      setEmails(['']);
      // Keep the message but maybe show it was sent
      toast.success('Referral invitations sent successfully! 🎊');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-mint-500" />
        <span className="ml-2 text-gray-600">Loading referral data...</span>
      </div>
    );
  }

  const progressPercentage = referralStats ? (referralStats.completedReferrals / Math.max(referralStats.totalReferrals, 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-mint-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mint-100 rounded-lg">
                <Users className="h-5 w-5 text-mint-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{referralStats?.totalReferrals || 0}</p>
                <p className="text-sm text-gray-600">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-mint-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{referralStats?.totalPointsEarned || 0}</p>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-mint-200">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-gray-500">{referralStats?.completedReferrals || 0} completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Form */}
      <Card className="border-mint-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Share2 className="h-5 w-5 text-mint-600" />
            Invite Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code Display */}
          <div className="space-y-2">
            <Label htmlFor="referral-link" className="text-sm font-medium text-gray-700">
              Your Referral Link
            </Label>
            <div className="flex gap-2">
              <Input
                id="referral-link"
                value={referralStats?.referralCode ? `${window.location.origin}?ref=${referralStats.referralCode}` : 'Loading...'}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button 
                onClick={copyReferralLink}
                variant="outline"
                className="shrink-0"
                disabled={!referralStats?.referralCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Referral Link
              </Button>
            </div>
          </div>

          {/* Email Addresses */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Email Addresses
            </Label>
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1"
                    disabled={isSendingEmails}
                  />
                  {emails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEmailField(index)}
                      disabled={isSendingEmails}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEmailField}
                className="w-full"
                disabled={isSendingEmails}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Email
              </Button>
            </div>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="personal-message" className="text-sm font-medium text-gray-700">
              Personal Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="personal-message"
              placeholder="Write a personal message to your friends..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={8}
              className="resize-none"
              disabled={isSendingEmails}
              required
            />
            <p className="text-xs text-gray-500">
              Your referral link is included in the message above. Feel free to customize it!
            </p>
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSendEmails}
            className="w-full bg-mint-600 hover:bg-mint-700 text-white"
            disabled={isSendingEmails}
          >
            {isSendingEmails ? (
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
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="border-mint-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Gift className="h-5 w-5 text-mint-600" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-mint-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Share Your Link</h4>
                <p className="text-sm text-gray-600">Send your unique referral link to friends via email or copy it to share anywhere.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-mint-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Friend Signs Up</h4>
                <p className="text-sm text-gray-600">When your friend creates an account using your link, you both get rewarded.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-mint-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Earn Rewards</h4>
                <p className="text-sm text-gray-600">Get bonus features and points for every successful referral.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
