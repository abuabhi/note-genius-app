import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, MessageCircle, Mail, Linkedin, Twitter, QrCode, Loader2, Eye } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { Suspense, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { EmailSharingDialog } from './EmailSharingDialog';

const ReferralSharingSectionContent = () => {
  const { 
    referralStats, 
    generateReferralLink, 
    shareViaWhatsApp, 
    copyReferralLink, 
    shareViaLinkedIn, 
    shareViaTwitter, 
    generateQRCode,
    isLoading 
  } = useReferralData();

  const [previewPlatform, setPreviewPlatform] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

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
        return `🎓 Hey! I've been using StudyBuddy for my studies and it's absolutely incredible! 

✨ It's transformed how I learn:
• Smart AI flashcards that adapt to my style
• Instant note organization with AI insights
• Progress tracking that keeps me motivated
• Study with friends through collaboration features

📈 My grades have improved significantly since I started using it!

🎁 Join using my code: ${code}
👉 Direct link: ${link}

We'll both get awesome rewards when you sign up! Let's study smarter together! 🚀📚

#StudyBuddy #SmartLearning`;

      case 'linkedin':
        return `🎓 Excited to share StudyBuddy - a game-changing platform that's revolutionized my learning approach!

🚀 Key transformations I've experienced:
✅ AI-powered flashcard generation that adapts to my learning patterns
✅ Intelligent note organization with automated insights
✅ Comprehensive progress analytics and goal tracking
✅ Seamless collaboration features for group study sessions

📊 The impact on my academic performance has been remarkable - improved efficiency, better retention, and higher grades.

Perfect for students, professionals, and lifelong learners seeking to optimize their study experience with cutting-edge AI technology.

🔗 Experience it yourself: ${link}

#StudyBuddy #EdTech #ArtificialIntelligence #LearningOptimization #StudentSuccess #ProfessionalDevelopment #EducationInnovation`;

      case 'twitter':
        return `🎓 Game-changer alert! @StudyBuddy has completely transformed my learning experience 

🔥 What's amazing:
✨ AI flashcards that adapt to YOU
📝 Smart note organization
📊 Progress tracking that motivates
🤝 Collaborative study features

📈 My grades have never been better!

Try it: ${link}

#StudyBuddy #EdTech #AI #StudentLife #LearningHacks #StudyTips #Education`;

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
      platform: 'whatsapp',
      description: 'Share with friends and family instantly'
    },
    {
      icon: Mail,
      label: 'Email',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => setShowEmailDialog(true),
      platform: 'email',
      description: 'Send personalized emails from your account'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800',
      onClick: () => shareViaLinkedIn(referralStats.referralCode),
      platform: 'linkedin',
      description: 'Share professionally with your network'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
      onClick: () => shareViaTwitter(referralStats.referralCode),
      platform: 'twitter',
      description: 'Tweet to your followers'
    },
    {
      icon: QrCode,
      label: 'QR Code',
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => generateQRCode(referralStats.referralCode),
      platform: 'qr',
      description: 'Perfect for in-person sharing'
    }
  ];

  return (
    <>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {sharingOptions.map((option) => (
                <div key={option.label} className="relative group">
                  <Button
                    onClick={option.onClick}
                    className={`${option.color} text-white flex flex-col items-center gap-3 h-auto py-6 w-full relative transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                  >
                    <option.icon className="h-8 w-8" />
                    <div className="text-center">
                      <span className="font-semibold">{option.label}</span>
                      <p className="text-xs opacity-90 mt-1">{option.description}</p>
                    </div>
                  </Button>
                  
                  {option.platform !== 'qr' && option.platform !== 'email' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-8 w-8 p-0 bg-white border border-gray-300 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPlatform(option.platform);
                          }}
                        >
                          <Eye className="h-4 w-4" />
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

          {/* Enhanced Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-mint-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              💡 Pro Sharing Tips
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-blue-800 text-sm">
              <ul className="space-y-2">
                <li>• <strong>Email:</strong> Sent from your personal account for trust</li>
                <li>• <strong>WhatsApp:</strong> Perfect for close friends and family</li>
                <li>• <strong>LinkedIn:</strong> Great for professional network</li>
              </ul>
              <ul className="space-y-2">
                <li>• <strong>Twitter:</strong> Reach your social followers</li>
                <li>• <strong>QR Code:</strong> Ideal for study groups and events</li>
                <li>• <strong>Preview:</strong> Click 👁️ to see content before sharing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Sharing Dialog */}
      <EmailSharingDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        referralCode={referralStats.referralCode}
        referralLink={referralLink}
      />
    </>
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
