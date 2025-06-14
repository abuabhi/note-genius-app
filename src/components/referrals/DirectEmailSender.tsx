
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Mail, Plus, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface DirectEmailSenderProps {
  referralCode: string;
  referralLink: string;
}

export const DirectEmailSender = ({ referralCode, referralLink }: DirectEmailSenderProps) => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<string[]>(['']);
  const [personalMessage, setPersonalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);

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

    setIsLoading(true);
    const senderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'A friend';
    let successCount = 0;
    let errorCount = 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      for (const email of validEmails) {
        try {
          const { data, error } = await supabase.functions.invoke('send-referral-email', {
            body: {
              referralCode,
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
        toast.success(`Successfully sent ${successCount} referral email${successCount > 1 ? 's' : ''}! 🎉`, {
          description: 'Your friends will receive their invitations shortly.',
        });
        
        // Clear sent emails from the form
        setEmails(emails.filter(email => !sentEmails.includes(email.trim())));
        if (emails.filter(email => !sentEmails.includes(email.trim())).length === 0) {
          setEmails(['']);
          setPersonalMessage('');
        }
      }

      if (errorCount > 0) {
        toast.error(`Failed to send ${errorCount} email${errorCount > 1 ? 's' : ''}`, {
          description: 'Please check the email addresses and try again.',
        });
      }

    } catch (error) {
      console.error('Error sending referral emails:', error);
      toast.error('Failed to send referral emails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          
          {emails.length >= 10 && (
            <p className="text-xs text-green-600 mt-1">Maximum 10 emails per batch</p>
          )}
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

        <div className="bg-green-100 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">📧 Email Preview</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>From:</strong> PrepGenie &lt;no-reply@prepgenie.io&gt;</p>
            <p><strong>Subject:</strong> {user?.user_metadata?.full_name || 'A friend'} invited you to join PrepGenie - Smart Study Platform! 📚</p>
            <p><strong>Content:</strong> Professional invitation with your referral link and code</p>
          </div>
        </div>

        <Button
          onClick={sendReferralEmails}
          disabled={isLoading || emails.every(email => !email.trim() || sentEmails.includes(email.trim()))}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
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
  );
};
