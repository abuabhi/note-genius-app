
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, Loader2 } from 'lucide-react';
import { exportService, ContentType, EmailOptions } from './ExportService';
import { Note } from '@/types/note';
import { toast } from 'sonner';

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  contentType: ContentType;
}

export const EmailDialog = ({ isOpen, onClose, note, contentType }: EmailDialogProps) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getContentTitle = (type: ContentType): string => {
    switch (type) {
      case 'original': return 'Original Content';
      case 'summary': return 'Summary';
      case 'keyPoints': return 'Key Points';
      case 'improved': return 'Improved Content';
      case 'markdown': return 'Markdown Content';
      default: return 'Content';
    }
  };

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const emailOptions: EmailOptions = {
        contentType,
        note,
        recipientEmail: email.trim(),
        subject: subject.trim() || `${note.title || 'Note'} - ${getContentTitle(contentType)}`,
        message: message.trim()
      };

      await exportService.sendEmail(emailOptions);
      toast.success('Email sent successfully!');
      onClose();
      
      // Reset form
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-mint-600" />
            Email Note Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-mint-50 p-3 rounded-lg">
            <div className="font-medium">Sending: {getContentTitle(contentType)}</div>
            <div className="text-xs mt-1">From note: "{note.title || 'Untitled Note'}"</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              placeholder={`${note.title || 'Note'} - ${getContentTitle(contentType)}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isLoading} className="bg-mint-600 hover:bg-mint-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
