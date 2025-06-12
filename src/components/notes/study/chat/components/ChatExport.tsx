import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Mail, Send, Loader2 } from 'lucide-react';
import { ChatUIMessage } from '../types/noteChat';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ChatExportProps {
  messages: ChatUIMessage[];
  note: Note;
}

export const ChatExport = ({ messages, note }: ChatExportProps) => {
  const [format, setFormat] = useState<'txt' | 'json' | 'markdown'>('txt');
  const [isOpen, setIsOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const exportAsText = () => {
    const content = messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const sender = msg.type === 'user' ? 'You' : 'AI Assistant';
      return `[${timestamp}] ${sender}: ${msg.content}`;
    }).join('\n\n');

    return `Chat History for: ${note.title}\nDate: ${new Date().toLocaleString()}\n\n${content}`;
  };

  const exportAsMarkdown = () => {
    const content = messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const sender = msg.type === 'user' ? '**You**' : '**AI Assistant**';
      return `### ${sender} - ${timestamp}\n\n${msg.content}\n`;
    }).join('\n');

    return `# Chat History for: ${note.title}\n\n*Exported on: ${new Date().toLocaleString()}*\n\n${content}`;
  };

  const exportAsJSON = () => {
    return JSON.stringify({
      noteTitle: note.title,
      exportDate: new Date().toISOString(),
      messages: messages.map(msg => ({
        timestamp: msg.timestamp,
        type: msg.type,
        content: msg.content,
        followUpQuestions: msg.followUpQuestions
      }))
    }, null, 2);
  };

  const formatChatForEmail = () => {
    return messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const sender = msg.type === 'user' ? 'You' : 'AI Assistant';
      const messageClass = msg.type === 'user' ? 'user-message' : 'ai-message';
      
      return `
        <div class="message ${messageClass}">
          <div class="message-header">${sender}</div>
          <div class="message-content">${msg.content.replace(/\n/g, '<br>')}</div>
          <div class="timestamp">${timestamp}</div>
        </div>
      `;
    }).join('');
  };

  const downloadFile = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = exportAsText();
        filename = `chat-${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        mimeType = 'text/plain';
        break;
      case 'markdown':
        content = exportAsMarkdown();
        filename = `chat-${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = exportAsJSON();
        filename = `chat-${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Chat exported successfully!');
    setIsOpen(false);
  };

  const sendViaEmail = async () => {
    if (!emailAddress.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (messages.length === 0) {
      toast.error('No chat messages to send');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending email with chat history...');
      console.log('Messages count:', messages.length);
      console.log('Note title:', note.title);
      console.log('Recipient:', emailAddress);

      const chatHistory = formatChatForEmail();
      const subject = `Chat History for "${note.title}"`;

      const { data, error } = await supabase.functions.invoke('send-chat-email', {
        body: {
          to: emailAddress.trim(),
          subject: subject,
          chatHistory: chatHistory,
          noteTitle: note.title
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('Email sent successfully:', data);
      toast.success(`Chat history sent to ${emailAddress}!`);
      setEmailDialogOpen(false);
      setEmailAddress('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      toast.error(`Failed to send email: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Chat History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Export Format</label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={downloadFile} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={() => setEmailDialogOpen(true)} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Email Chat History
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              <div className="font-medium">Sending chat history for: "{note.title}"</div>
              <div className="text-xs mt-1">{messages.length} messages will be included</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={sendViaEmail} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
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
    </>
  );
};
