
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Send, Copy, Users, Trophy, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { useSendReferralEmails } from '@/hooks/referrals/useSendReferralEmails';
import { useSharingUtils } from '@/hooks/referrals/useSharingUtils';

export const SimplifiedReferralForm = () => {
  const { referralData, loading: dataLoading } = useReferralData();
  const { sendReferralEmails, isLoading: emailLoading } = useSendReferralEmails();
  const { shareReferralLink, copyReferralLink } = useSharingUtils();
  
  const [emails, setEmails] = useState<string[]>(['']);
  const [currentEmail, setCurrentEmail] = useState('');
  const [message, setMessage] = useState(
    "Hey! I've been using PrepGenie for my studies and it's been amazing. You should check it out - they have great tools for flashcards, notes, and study planning. Use my referral link to get started!"
  );

  const addEmailField = () => {
    if (emails.length < 10) {
      setEmails([...emails, '']);
    }
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addCurrentEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails.filter(e => e !== ''), currentEmail]);
      setCurrentEmail('');
    }
  };

  const handleSendInvitations = async () => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    if (!referralData?.referralCode) {
      toast.error('Unable to get your referral code. Please try again.');
      return;
    }

    const success = await sendReferralEmails(validEmails, message, referralData.referralCode);
    
    if (success) {
      // Clear the form on success
      setEmails(['']);
      setCurrentEmail('');
    }
  };

  const handleCopyLink = async () => {
    if (referralData?.referralCode) {
      await copyReferralLink(referralData.referralCode);
    }
  };

  const handleShareLink = async () => {
    if (referralData?.referralCode) {
      await shareReferralLink(referralData.referralCode);
    }
  };

  if (dataLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
          <span className="ml-2 text-gray-600">Loading referral data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-mint-50 to-white border-mint-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-mint-600">Total Referrals</p>
                <p className="text-3xl font-bold text-mint-700">{referralData?.totalReferrals || 0}</p>
              </div>
              <Users className="h-8 w-8 text-mint-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Points Earned</p>
                <p className="text-3xl font-bold text-purple-700">{referralData?.totalPoints || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Rewards</p>
                <p className="text-3xl font-bold text-orange-700">Coming Soon</p>
              </div>
              <Gift className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-mint-600" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Your unique referral code:</p>
              <p className="text-lg font-mono font-semibold text-gray-900">
                {referralData?.referralCode || 'Loading...'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareLink}>
                <Send className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Invitations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-mint-600" />
            Send Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Email */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter friend's email address"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCurrentEmail()}
              className="flex-1"
            />
            <Button onClick={addCurrentEmail} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Email List */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Recipients:</label>
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Email ${index + 1}`}
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  className="flex-1"
                />
                {emails.length > 1 && (
                  <Button
                    onClick={() => removeEmailField(index)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {emails.length < 10 && (
              <Button onClick={addEmailField} variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Another Email
              </Button>
            )}
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Personal Message (Optional):
            </label>
            <Textarea
              placeholder="Add a personal touch to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be included in the invitation email along with your referral link.
            </p>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendInvitations}
            disabled={emailLoading || !referralData?.referralCode}
            className="w-full bg-mint-600 hover:bg-mint-700 text-white"
            size="lg"
          >
            {emailLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Invitations...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Invitations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="h-6 w-6 text-mint-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Share Your Link</h3>
              <p className="text-sm text-gray-600">
                Send your unique referral link to friends via email or social media
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Friends Sign Up</h3>
              <p className="text-sm text-gray-600">
                When they register using your link, they join PrepGenie with your referral
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Get points for each successful referral and unlock exclusive rewards
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
