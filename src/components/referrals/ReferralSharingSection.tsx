
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, MessageCircle, Mail, Linkedin, Twitter, QrCode, Loader2 } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { Suspense } from 'react';

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

  const sharingOptions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => shareViaWhatsApp(referralStats.referralCode)
    },
    {
      icon: Mail,
      label: 'Email',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => shareViaEmail(referralStats.referralCode)
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800',
      onClick: () => shareViaLinkedIn(referralStats.referralCode)
    },
    {
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-sky-500 hover:bg-sky-600',
      onClick: () => shareViaTwitter(referralStats.referralCode)
    },
    {
      icon: QrCode,
      label: 'QR Code',
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => generateQRCode(referralStats.referralCode)
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
              <Button
                key={option.label}
                onClick={option.onClick}
                className={`${option.color} text-white flex flex-col items-center gap-2 h-auto py-4`}
              >
                <option.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Sharing Tips</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Share with friends who are students or educators</li>
            <li>• Mention the benefits they'll get by joining</li>
            <li>• Use social media to reach more people</li>
            <li>• QR codes work great for in-person sharing</li>
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
