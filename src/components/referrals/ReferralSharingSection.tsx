
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, MessageCircle, Mail, Linkedin, Twitter, QrCode, Loader2, Eye } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { Suspense, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const ReferralSharingSectionContent = () => {
  const { 
    referralStats, 
    generateReferralLink, 
    shareViaWhatsApp, 
    copyReferralLink, 
    shareViaEmail, 
    shareViaLinkedIn, 
    shareViaTwitter, 
    generateQRCode,
    isLoading 
  } = useReferralData();

  const [previewPlatform, setPreviewPlatform] = useState<string | null>(null);

  if (isLoading || !referralStats) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
            <span className="ml-2 text-gray-600">Loading sharing options...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const referralLink = generateReferralLink(referralStats.referralCode);

  const getPreviewContent = (platform: string) => {
    const link = referralLink;
    const code = referralStats.referralCode;
    
    switch (platform) {
      case 'whatsapp':
        return `🎓 Hey! I've been using StudyBuddy for my studies and it's incredible! 

✨ It's helped me:
• Organize my notes better
• Create smart flashcards instantly
• Track my study progress
• Ace my exams with AI-powered insights

🎁 Join using my code: ${code}
👉 Or click here: ${link}

We'll both get awesome rewards! Let's study smarter together! 🚀📚`;

      case 'email':
        return `Hi there!

I wanted to share something that's been a game-changer for my studies - StudyBuddy!

🎯 What makes it special:
• Smart flashcards that adapt to your learning style
• AI-powered note organization and insights
• Progress tracking that keeps you motivated
• Collaborative study features

I've seen real improvements in my grades and study efficiency since I started using it.

🎁 Get started with my referral link:
${link}

Use my code: ${code}

When you sign up, we both get rewards! It's a win-win 🎉

Give it a try - I think you'll love it as much as I do!

Best regards`;

      case 'linkedin':
        return `🎓 Excited to share StudyBuddy - a platform that's revolutionizing how I approach learning!

Key benefits I've experienced:
✅ Smart flashcard generation with AI
✅ Organized note-taking system  
✅ Progress tracking & analytics
✅ Collaborative study features

It's significantly improved my study efficiency and results. Highly recommend for students and professionals looking to enhance their learning experience.

Check it out: ${link}

#StudyBuddy #Learning #Education #ProductivityTools #StudentLife #AI #StudyTips`;

      case 'twitter':
        return `🎓 Just discovered @StudyBuddy - game-changing study platform! 

✨ AI flashcards
📝 Smart notes  
📊 Progress tracking
🤝 Collaboration

Boosted my grades significantly! 

Try it: ${link}

#StudyBuddy #EdTech #StudentLife #AI #Learning`;

      default:
        return '';
    }
  };

  const sharingOptions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => shareViaWhatsApp(referralStats.referralCode),
      platform: 'whatsapp'
    },
    {
      icon: Mail,
      label: 'Email',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => shareViaEmail(referralStats.referralCode),
      platform: 'email'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800',
      onClick: () => shareViaLinkedIn(referralStats.referralCode),
      platform: 'linkedin'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
      onClick: () => shareViaTwitter(referralStats.referralCode),
      platform: 'twitter'
    },
    {
      icon: QrCode,
      label: 'QR Code',
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => generateQRCode(referralStats.referralCode),
      platform: 'qr'
    }
  ];

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
          <Share2 className="h-6 w-6 text-mint-600 mr-3" />
          Share Your Referral Code
        </CardTitle>
        <p className="text-gray-600">Invite friends and earn rewards together!</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Referral Code Section */}
        <div className="bg-mint-50 rounded-xl p-6 border border-mint-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-mint-900">Your Referral Code</h3>
            <p className="text-mint-700 text-sm">Share this code or link with friends</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="referral-code" className="text-mint-800 font-medium">Referral Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="referral-code"
                  value={referralStats.referralCode}
                  readOnly
                  className="font-mono text-center text-lg font-bold bg-white border-mint-300"
                />
                <Button
                  onClick={() => copyReferralLink(referralStats.referralCode)}
                  className="bg-mint-600 hover:bg-mint-700 text-white"
                  size="icon"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="referral-link" className="text-mint-800 font-medium">Referral Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="referral-link"
                  value={referralLink}
                  readOnly
                  className="text-sm bg-white border-mint-300"
                />
                <Button
                  onClick={() => copyReferralLink(referralStats.referralCode)}
                  className="bg-mint-600 hover:bg-mint-700 text-white"
                  size="icon"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Share Options */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Quick Share Options</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {sharingOptions.map((option) => (
              <div key={option.label} className="relative">
                <Button
                  onClick={option.onClick}
                  className={`${option.color} text-white flex flex-col items-center gap-2 h-auto py-4 w-full`}
                >
                  <option.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
                
                {option.platform !== 'qr' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPlatform(option.platform);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <option.icon className="h-5 w-5" />
                          {option.label} Preview
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Content to be shared:</Label>
                          <Textarea
                            value={getPreviewContent(option.platform)}
                            readOnly
                            className="mt-2 min-h-[200px] text-sm"
                          />
                        </div>
                        <Button
                          onClick={option.onClick}
                          className={`${option.color} text-white w-full`}
                        >
                          Share on {option.label}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Sharing Tips</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Click the eye icon (👁️) on any platform to preview the content before sharing</li>
            <li>• Personal messages work better - add your own experience with StudyBuddy</li>
            <li>• Share with friends who are students, educators, or lifelong learners</li>
            <li>• QR codes are perfect for in-person sharing at study groups</li>
            <li>• Email allows you to customize the message for each recipient</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

const ReferralSharingSectionLoading = () => (
  <Card className="border-gray-200 bg-white shadow-sm">
    <CardContent className="p-8">
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
        <span className="ml-2 text-gray-600">Loading sharing options...</span>
      </div>
    </CardContent>
  </Card>
);

export const ReferralSharingSection = () => {
  return (
    <Suspense fallback={<ReferralSharingSectionLoading />}>
      <ReferralSharingSectionContent />
    </Suspense>
  );
};
