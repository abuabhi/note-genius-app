
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Mail } from 'lucide-react';
import { ChatUIMessage } from '../types/noteChat';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ChatExportProps {
  messages: ChatUIMessage[];
  note: Note;
}

export const ChatExport = ({ messages, note }: ChatExportProps) => {
  const [format, setFormat] = useState<'txt' | 'json' | 'markdown'>('txt');
  const [isOpen, setIsOpen] = useState(false);

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

  const shareViaEmail = () => {
    const content = exportAsText();
    const subject = `Chat History: ${note.title}`;
    const body = encodeURIComponent(content);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
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
            <Button variant="outline" onClick={shareViaEmail} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
