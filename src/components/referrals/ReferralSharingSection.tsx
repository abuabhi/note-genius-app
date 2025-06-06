
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Share2, QrCode, MessageCircle, Linkedin, Loader2 } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { toast } from 'sonner';

export const ReferralSharingSection = () => {
  const { referralStats, copyReferralLink } = useReferralData();

  const generateReferralLink = () => {
    if (!referralStats?.referralCode) return '';
    return `${window.location.origin}?ref=${referralStats.referralCode}`;
  };

  const shareViaEmail = () => {
    const link = generateReferralLink();
    const subject = "Try StudyBuddy - Great Study Platform";
    const body = `Hi there!

I've been using StudyBuddy for my studies and thought you might find it helpful too. It's a comprehensive platform with smart flashcards, note organization, and progress tracking.

Here's my referral link to get started:
${link}

Best regards!`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaLinkedIn = () => {
    const link = generateReferralLink();
    const text = "Discovered an excellent study platform that's been helping me stay organized and improve my learning efficiency. Check out StudyBuddy:";
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareViaTwitter = () => {
    const link = generateReferralLink();
    const text = "Found a great study platform that's been helping me stay organized and learn more effectively. Check out StudyBuddy:";
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    window.open(twitterUrl, '_blank');
  };

  const generateQRCode = () => {
    const link = generateReferralLink();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>StudyBuddy Referral QR Code</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Scan to Join StudyBuddy</h2>
            <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px; border-radius: 8px;" />
            <p style="margin-top: 20px; text-align: center; color: #666;">
              Share this QR code for easy mobile access
            </p>
          </body>
        </html>
      `);
    }
  };

  const referralCode = referralStats?.referralCode;
  const isCodeLoading = !referralCode || referralCode === 'LOADING';

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Share2 className="h-6 w-6" />
          Share Your Referral Code
        </CardTitle>
        <p className="text-gray-600">Choose how you'd like to share StudyBuddy with your friends</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Referral Code Display */}
        <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
          <div className="text-sm text-gray-700 mb-2 font-medium">Your Referral Code:</div>
          <div className="font-mono text-2xl font-bold text-gray-900 bg-white rounded-lg py-3 px-4 border border-gray-300">
            {isCodeLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-mint-500" />
                <span className="text-lg">Loading...</span>
              </div>
            ) : (
              referralCode
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Share this code or use the sharing options below</p>
        </div>

        {/* Sharing Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => copyReferralLink(referralCode || '')}
            disabled={isCodeLoading}
            className="h-20 bg-mint-600 hover:bg-mint-700 text-white flex flex-col gap-2"
          >
            <Copy className="h-5 w-5" />
            <span className="text-sm">Copy Link</span>
          </Button>
          
          <Button
            onClick={shareViaEmail}
            disabled={isCodeLoading}
            variant="outline"
            className="h-20 border-gray-300 text-gray-700 hover:bg-gray-50 flex flex-col gap-2"
          >
            <Mail className="h-5 w-5" />
            <span className="text-sm">Email</span>
          </Button>
          
          <Button
            onClick={shareViaLinkedIn}
            disabled={isCodeLoading}
            variant="outline"
            className="h-20 border-blue-300 text-blue-700 hover:bg-blue-50 flex flex-col gap-2"
          >
            <Linkedin className="h-5 w-5" />
            <span className="text-sm">LinkedIn</span>
          </Button>
          
          <Button
            onClick={shareViaTwitter}
            disabled={isCodeLoading}
            variant="outline"
            className="h-20 border-sky-300 text-sky-700 hover:bg-sky-50 flex flex-col gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Twitter</span>
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={generateQRCode}
            disabled={isCodeLoading}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <QrCode className="h-5 w-5" />
            Generate QR Code
          </Button>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-center text-sm text-blue-800">
            <strong>Tip:</strong> Personal recommendations work best! Tell your friends why StudyBuddy has helped you succeed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
