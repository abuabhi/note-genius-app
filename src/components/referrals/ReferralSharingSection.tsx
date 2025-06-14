
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Share2, Mail, Linkedin, Twitter, Send, Plus, X, Check, Loader2, Eye } from 'lucide-react';
import { useReferralData } from '@/hooks/referrals/useReferralData';
import { Suspense, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmailSharingDialog } from './EmailSharingDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const ReferralSharingSectionContent = () => {
  const { user } = useAuth();
  const { 
    referralStats, 
    generateReferralLink, 
    copyReferralLink, 
    shareViaLinkedIn, 
    shareViaTwitter,
    isLoading 
  } = useReferralData();

  const [emails, setEmails] = useState<string[]>(['']);
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
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

  const addEmailField = () => {
    setEmails([...emails, '']);
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

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const sendReferralEmails = async () => {
    const validEmails = emails.filter(email => email.trim() && validateEmail(email.trim()));
    
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    setIsSending(true);
    const senderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'A friend';
    let successCount = 0;
    let errorCount = 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      for (const email of validEmails) {
        try {
          const { data, error } = await supabase.functions.invoke('send-referral-email', {
            body: {
              referralCode: referralStats.referralCode,
              referralLink,
              recipientEmail: email.trim(),
              senderName,
              personalMessage: personalMessage.trim()
            },
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          });

          if (error) throw error;

          if (data?.success) {
            successCount++;
            setSentEmails(prev => [...prev, email.trim()]);
          } else {
            throw new Error(data?.error || 'Failed to send email');
          }
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} referral email${successCount > 1 ? 's' : ''}! 🎉`);
        
        // Clear sent emails from the form
        setEmails(emails.filter(email => !sentEmails.includes(email.trim())));
        if (emails.filter(email => !sentEmails.includes(email.trim())).length === 0) {
          setEmails(['']);
          setPersonalMessage('');
        }
      }

      if (errorCount > 0) {
        toast.error(`Failed to send ${errorCount} email${errorCount > 1 ? 's' : ''}`);
      }

    } catch (error) {
      console.error('Error sending referral emails:', error);
      toast.error('Failed to send referral emails. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getPreviewContent = (platform: string) => {
    const link = referralLink;
    const code = referralStats.referralCode;
    
    switch (platform) {
      case 'linkedin':
        return `🎓 Excited to share PrepGenie - a game-changing platform that's revolutionized my learning approach!

🚀 Key transformations I've experienced:
✅ AI-powered flashcard generation that adapts to my learning patterns
✅ Intelligent note organization with automated insights
✅ Comprehensive progress analytics and goal tracking
✅ Seamless collaboration features for group study sessions

📊 The impact on my academic performance has been remarkable - improved efficiency, better retention, and higher grades.

Perfect for students, professionals, and lifelong learners seeking to optimize their study experience with cutting-edge AI technology.

🔗 Experience it yourself: ${link}

#PrepGenie #EdTech #ArtificialIntelligence #LearningOptimization #StudentSuccess #ProfessionalDevelopment #EducationInnovation`;

      case 'twitter':
        return `🎓 Game-changer alert! @PrepGenie has completely transformed my learning experience 

🔥 What's amazing:
✨ AI flashcards that adapt to YOU
📝 Smart note organization
📊 Progress tracking that motivates
🤝 Collaborative study features

📈 My grades have never been better!

Try it: ${link}

#PrepGenie #EdTech #AI #StudentLife #LearningHacks #StudyTips #Education`;

      default:
        return '';
    }
  };

  const socialOptions = [
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
    }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Direct Email Sending Section */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Mail className="h-5 w-5" />
              Send Direct Invitations
            </CardTitle>
            <p className="text-sm text-green-700">
              Send automatic emails from <strong>no-reply@prepgenie.io</strong> to your friends
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label className="text-green-800 font-medium">Email Recipients</Label>
              <div className="space-y-2 mt-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type="email"
                        placeholder="friend@example.com"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        className={`${
                          sentEmails.includes(email.trim()) 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-green-300 focus:border-green-500'
                        }`}
                        disabled={sentEmails.includes(email.trim())}
                      />
                      {sentEmails.includes(email.trim()) && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {emails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeEmailField(index)}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                        disabled={sentEmails.includes(email.trim())}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmailField}
                className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
                disabled={emails.length >= 10}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another Email
              </Button>
            </div>

            <div>
              <Label className="text-green-800 font-medium">Personal Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal note to make your invitation more meaningful..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="mt-2 border-green-300 focus:border-green-500 min-h-[80px]"
                maxLength={500}
              />
              <div className="text-xs text-green-600 mt-1 text-right">
                {personalMessage.length}/500 characters
              </div>
            </div>

            <Button
              onClick={sendReferralEmails}
              disabled={isSending || emails.every(email => !email.trim() || sentEmails.includes(email.trim()))}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Referral Emails ({emails.filter(email => email.trim() && !sentEmails.includes(email.trim())).length})
                </>
              )}
            </Button>

            {sentEmails.length > 0 && (
              <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-1">
                  ✅ Successfully sent to {sentEmails.length} recipient{sentEmails.length > 1 ? 's' : ''}:
                </p>
                <p className="text-xs text-green-700">
                  {sentEmails.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Code & Links Section */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Share2 className="h-5 w-5 text-mint-600 mr-2" />
              Your Referral Details
            </CardTitle>
            <p className="text-gray-600">Share your code or link with friends</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referral-code" className="text-gray-800 font-medium">Referral Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="referral-code"
                    value={referralStats.referralCode}
                    readOnly
                    className="font-mono text-center text-lg font-bold bg-gray-50 border-gray-300"
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
                <Label htmlFor="referral-link" className="text-gray-800 font-medium">Referral Link</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="referral-link"
                    value={referralLink}
                    readOnly
                    className="text-sm bg-gray-50 border-gray-300"
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

            {/* Social Sharing Options */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Social Sharing</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  onClick={() => setShowEmailDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Mail className="h-6 w-6" />
                  <div className="text-center">
                    <span className="font-semibold">Email Client</span>
                    <p className="text-xs opacity-90">Send from your email</p>
                  </div>
                </Button>

                {socialOptions.map((option) => (
                  <div key={option.label} className="relative group">
                    <Button
                      onClick={option.onClick}
                      className={`${option.color} text-white flex flex-col items-center gap-2 h-auto py-4 w-full`}
                    >
                      <option.icon className="h-6 w-6" />
                      <div className="text-center">
                        <span className="font-semibold">{option.label}</span>
                        <p className="text-xs opacity-90">{option.description}</p>
                      </div>
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-8 w-8 p-0 bg-white border border-gray-300 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
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
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-mint-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                💡 Sharing Tips
              </h4>
              <div className="text-blue-800 text-sm space-y-1">
                <p>• <strong>Direct Email:</strong> Automatic sending from PrepGenie</p>
                <p>• <strong>LinkedIn:</strong> Great for professional network</p>
                <p>• <strong>Twitter:</strong> Reach your social followers</p>
                <p>• <strong>Preview:</strong> Click 👁️ to see content before sharing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
