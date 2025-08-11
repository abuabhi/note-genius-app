
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, Trophy, Share2, Copy, Loader2, Linkedin, Twitter, Mail, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { useSendReferralEmails } from '@/hooks/referrals/useSendReferralEmails';

export const SimplifiedReferralForm = () => {
  const { toast } = useToast();
  const { referralStats, isLoading, generateReferralLink, copyReferralLink, shareViaLinkedIn, shareViaTwitter, generateRecommendedMessage, shareViaWhatsApp, shareViaEmail } = useReferralData();
  const { sendReferralEmails, isLoading: isSendingEmails } = useSendReferralEmails();
  
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message && referralStats?.referralCode) {
      setMessage(generateRecommendedMessage(referralStats.referralCode));
    }
  }, [referralStats?.referralCode]);

  const handleSendInvitations = async () => {
    if (!emails.trim()) {
      toast({
        title: "No emails provided",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    if (!referralStats?.referralCode) {
      toast({
        title: "Error",
        description: "Could not get your referral code. Please try again.",
        variant: "destructive"
      });
      return;
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);
    
    if (emailList.length === 0) {
      toast({
        title: "Invalid emails",
        description: "Please enter valid email addresses separated by commas",
        variant: "destructive"
      });
      return;
    }

    const success = await sendReferralEmails(emailList, message, referralStats.referralCode);
    
    if (success) {
      setEmails('');
      setMessage('');
    }
  };

  const handleCopyLink = async () => {
    if (referralStats?.referralCode) {
      await copyReferralLink(referralStats.referralCode);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-mint-500" />
        <span className="ml-2 text-muted-foreground">Loading referral data...</span>
      </div>
    );
  }

  const referralLink = referralStats?.referralCode ? generateReferralLink(referralStats.referralCode) : '';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-full">
            <Gift className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Invite Friends & Earn Rewards! 🎉
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Share PrepGenie with your friends and both of you get amazing benefits. 
          The more friends you invite, the more you earn!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">
              {referralStats?.totalReferrals || 0}
            </div>
            <p className="text-blue-700 text-sm">Total Referrals</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {referralStats?.completedReferrals || 0}
            </div>
            <p className="text-green-700 text-sm">Successful Referrals</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {referralStats?.totalPointsEarned || 0}
            </div>
            <p className="text-purple-700 text-sm">Points Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-mint-600" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopyLink} variant="outline" size="sm" disabled={!referralStats?.referralCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={!referralStats?.referralCode} onClick={() => referralStats?.referralCode && shareViaLinkedIn(referralStats.referralCode)}>
              <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
            </Button>
            <Button variant="outline" size="sm" disabled={!referralStats?.referralCode} onClick={() => referralStats?.referralCode && shareViaTwitter(referralStats.referralCode)}>
              <Twitter className="h-4 w-4 mr-1" /> Twitter
            </Button>
            <Button variant="outline" size="sm" disabled={!referralStats?.referralCode} onClick={() => referralStats?.referralCode && shareViaWhatsApp(referralStats.referralCode)}>
              <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" disabled={!referralStats?.referralCode} onClick={() => referralStats?.referralCode && shareViaEmail(referralStats.referralCode)}>
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Share this link with your friends. When they sign up using your link, you'll both get rewards!
          </p>
        </CardContent>
      </Card>

      {/* Send Invitations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-mint-600" />
            Send Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emails">Friend's Email Addresses</Label>
            <Textarea
              id="emails"
              placeholder="Enter email addresses separated by commas (e.g., friend1@email.com, friend2@email.com)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="mt-1"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple email addresses with commas
            </p>
          </div>
          
          <div>
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => referralStats?.referralCode && setMessage(generateRecommendedMessage(referralStats.referralCode))} disabled={!referralStats?.referralCode}>
                Use recommended message
              </Button>
              <Button variant="outline" size="sm" onClick={() => { if (message) { navigator.clipboard.writeText(message); toast({ title: 'Copied!', description: 'Message copied to clipboard' }); } }} disabled={!message}>
                <Copy className="h-4 w-4 mr-1" /> Copy message
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleSendInvitations}
            className="w-full bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700"
            disabled={isSendingEmails}
          >
            {isSendingEmails ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Invitations...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Send Invitations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
        <CardHeader>
          <CardTitle className="text-center text-mint-800">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="bg-mint-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-mint-700 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-mint-800 mb-2">Share Your Link</h3>
              <p className="text-mint-700 text-sm">
                Send your unique referral link to friends via email or social media
              </p>
            </div>
            <div>
              <div className="bg-mint-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-mint-700 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-mint-800 mb-2">Friend Signs Up</h3>
              <p className="text-mint-700 text-sm">
                Your friend creates an account using your referral link
              </p>
            </div>
            <div>
              <div className="bg-mint-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-mint-700 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-mint-800 mb-2">Both Get Rewards</h3>
              <p className="text-mint-700 text-sm">
                You and your friend both receive points and premium features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
