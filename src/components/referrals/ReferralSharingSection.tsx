
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Share2, QrCode, MessageCircle, Linkedin } from 'lucide-react';
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
    const subject = "🚀 You NEED to try StudyBuddy - it's a game changer!";
    const body = `Hey there! 👋

I've been using StudyBuddy for my studies and it's absolutely incredible! 🤯

It's like having a personal study assistant that actually gets it. The flashcards are smart, the notes organization is *chef's kiss*, and the progress tracking keeps me motivated every day.

I think you'd absolutely love it! Use my referral link to get started:
${link}

Trust me on this one - your future self will thank you! 📚✨

Happy studying!`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaLinkedIn = () => {
    const link = generateReferralLink();
    const text = "Just discovered StudyBuddy - the most innovative study platform I've ever used! 🚀 Smart flashcards, AI-powered notes, and amazing progress tracking. Check it out:";
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareViaTwitter = () => {
    const link = generateReferralLink();
    const text = "🔥 Found the ultimate study companion! @StudyBuddy makes learning actually fun with smart flashcards and AI features. Game changer! 🚀";
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    window.open(twitterUrl, '_blank');
  };

  const generateQRCode = () => {
    const link = generateReferralLink();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    
    // Open QR code in new window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>StudyBuddy Referral QR Code</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; padding: 20px; font-family: Arial, sans-serif;">
            <h2>📱 Scan to Join StudyBuddy!</h2>
            <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px; border-radius: 8px;" />
            <p style="margin-top: 20px; text-align: center; color: #666;">
              Perfect for sharing with friends on mobile!<br/>
              Just show them this QR code to scan.
            </p>
          </body>
        </html>
      `);
    }
  };

  const referralCode = referralStats?.referralCode;
  const isCodeLoading = !referralCode || referralCode === 'LOADING...';

  return (
    <Card className="border-mint-200 bg-gradient-to-r from-mint-50 to-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-mint-800 flex items-center justify-center gap-2">
          <Share2 className="h-6 w-6" />
          Share the StudyBuddy Magic! ✨
        </CardTitle>
        <p className="text-mint-600">Choose your weapon of choice to spread the study love!</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Referral Code Display */}
        <div className="bg-white/80 rounded-xl p-6 border border-mint-200 text-center">
          <div className="text-sm text-mint-700 mb-2 font-medium">Your Secret Referral Code:</div>
          <div className="font-mono text-2xl font-bold text-mint-800 bg-mint-100 rounded-lg py-3 px-4 border-2 border-dashed border-mint-300">
            {isCodeLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-mint-500 border-t-transparent rounded-full"></div>
                <span className="text-lg">Generating your code...</span>
              </div>
            ) : (
              referralCode
            )}
          </div>
          <p className="text-xs text-mint-500 mt-2">This is your unique code - guard it with your life! (Or share it freely, we're not your boss) 😄</p>
        </div>

        {/* Sharing Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => copyReferralLink(referralCode || '')}
            disabled={isCodeLoading}
            className="h-16 bg-mint-600 hover:bg-mint-700 text-white flex flex-col gap-1"
          >
            <Copy className="h-5 w-5" />
            <span className="text-sm">Copy Link</span>
          </Button>
          
          <Button
            onClick={shareViaEmail}
            disabled={isCodeLoading}
            variant="outline"
            className="h-16 border-mint-300 text-mint-700 hover:bg-mint-50 flex flex-col gap-1"
          >
            <Mail className="h-5 w-5" />
            <span className="text-sm">Email Friend</span>
          </Button>
          
          <Button
            onClick={shareViaLinkedIn}
            disabled={isCodeLoading}
            variant="outline"
            className="h-16 border-blue-300 text-blue-700 hover:bg-blue-50 flex flex-col gap-1"
          >
            <Linkedin className="h-5 w-5" />
            <span className="text-sm">LinkedIn Post</span>
          </Button>
          
          <Button
            onClick={shareViaTwitter}
            disabled={isCodeLoading}
            variant="outline"
            className="h-16 border-sky-300 text-sky-700 hover:bg-sky-50 flex flex-col gap-1"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Tweet It</span>
          </Button>
          
          <Button
            onClick={generateQRCode}
            disabled={isCodeLoading}
            variant="outline"
            className="h-16 border-purple-300 text-purple-700 hover:bg-purple-50 flex flex-col gap-1"
          >
            <QrCode className="h-5 w-5" />
            <span className="text-sm">QR Code</span>
          </Button>
          
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border border-yellow-300 flex flex-col justify-center">
            <div className="text-2xl text-center mb-1">🎯</div>
            <div className="text-xs text-center text-orange-700 font-medium">More options coming soon!</div>
          </div>
        </div>

        <div className="bg-mint-100/50 rounded-lg p-4 border border-mint-200">
          <p className="text-center text-sm text-mint-700">
            <strong>Pro Tip:</strong> Personal messages work best! Tell them why YOU love StudyBuddy - your enthusiasm is contagious! 🔥
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
