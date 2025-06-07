
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Mail, Send, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface EmailSharingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  referralLink: string;
}

export const EmailSharingDialog = ({ isOpen, onClose, referralCode, referralLink }: EmailSharingDialogProps) => {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState("Join me on StudyBuddy - Transform your learning experience!");
  const [message, setMessage] = useState(`Hi there!

I wanted to share something that's been a game-changer for my studies - StudyBuddy!

🎯 What makes it special:
• Smart flashcards that adapt to your learning style
• AI-powered note organization and insights
• Progress tracking that keeps you motivated
• Collaborative study features

I've seen real improvements in my grades and study efficiency since I started using it.

🎁 Get started with my referral link:
${referralLink}

Use my code: ${referralCode}

When you sign up, we both get rewards! It's a win-win 🎉

Give it a try - I think you'll love it as much as I do!

Best regards`);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard! 📋`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSendEmail = () => {
    if (!recipients.trim()) {
      toast.error('Please enter at least one email recipient');
      return;
    }

    const mailtoLink = `mailto:${recipients.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    
    try {
      // Try to open the email client
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message with fallback instructions
      toast.success('Email client should open now!', {
        description: 'If your email client didn\'t open, try copying the content and sending manually.',
        duration: 5000,
      });
      
      // Don't close the dialog immediately - let user verify it worked
      setTimeout(() => {
        // Show a follow-up toast asking if it worked
        toast.info('Did your email client open?', {
          description: 'If not, you can copy the email content below and send it manually.',
          duration: 8000,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error opening email client:', error);
      toast.error('Unable to open email client', {
        description: 'Please copy the email content and send it manually from your preferred email app.',
        duration: 6000,
      });
    }
  };

  const copyFullEmail = () => {
    const fullEmailContent = `To: ${recipients}
Subject: ${subject}

${message}`;
    
    copyToClipboard(fullEmailContent, 'Complete email');
  };

  const characterCount = message.length;
  const isMessageTooLong = characterCount > 2000;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-mint-600" />
            Share StudyBuddy via Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This will try to open your default email client. If it doesn't work, you can copy the email content and send it manually from your preferred email app.
            </AlertDescription>
          </Alert>

          {/* Referral Info */}
          <div className="bg-mint-50 rounded-lg p-4 border border-mint-200">
            <h3 className="font-semibold text-mint-900 mb-2">Your Referral Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span><strong>Code:</strong> {referralCode}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(referralCode, 'Referral code')}
                  className="h-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate mr-2"><strong>Link:</strong> {referralLink}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(referralLink, 'Referral link')}
                  className="h-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipients" className="text-sm font-medium">
                Email Recipients <span className="text-red-500">*</span>
              </Label>
              <Input
                id="recipients"
                type="email"
                placeholder="friend1@example.com, friend2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="mt-1"
                multiple
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
                maxLength={100}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Keep it engaging and personal</span>
                <span>{subject.length}/100</span>
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 min-h-[200px] resize-none"
                maxLength={2500}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={isMessageTooLong ? 'text-red-500' : 'text-gray-500'}>
                  {isMessageTooLong ? 'Message is quite long - consider shortening it' : 'Feel free to personalize this message'}
                </span>
                <span className={characterCount > 2000 ? 'text-orange-500' : 'text-gray-500'}>
                  {characterCount}/2500
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyFullEmail}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Full Email
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={!recipients.trim()}
                  className="bg-mint-600 hover:bg-mint-700 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Email Client
                </Button>
              </div>
            </div>
            
            {/* Manual email instructions */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Alternative:</strong> If the email client doesn't open, click "Copy Full Email" above and paste it into your preferred email app (Gmail, Outlook, Apple Mail, etc.).
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
