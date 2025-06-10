
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MessageFeedbackProps {
  messageId: string;
  content: string;
  onFeedback?: (messageId: string, type: 'helpful' | 'unhelpful') => void;
}

export const MessageFeedback = ({ messageId, content, onFeedback }: MessageFeedbackProps) => {
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedback(type);
    onFeedback?.(messageId, type);
    toast.success(type === 'helpful' ? 'Thanks for the feedback!' : 'Feedback noted, we\'ll improve!');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${feedback === 'helpful' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
              onClick={() => handleFeedback('helpful')}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Helpful</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${feedback === 'unhelpful' ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
              onClick={() => handleFeedback('unhelpful')}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Not helpful</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? 'Copied!' : 'Copy message'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
