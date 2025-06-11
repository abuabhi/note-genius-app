
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageRendererProps {
  content: string;
  isCurrentUser: boolean;
  className?: string;
}

export const MessageRenderer = ({ content, isCurrentUser, className = '' }: MessageRendererProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  const maxLength = 500;
  const shouldTruncate = content.length > maxLength;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.substring(0, maxLength) + '...'
    : content;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied',
        description: 'Message copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy message',
        variant: 'destructive',
      });
    }
  };

  const markdownComponents = {
    p: ({ children, ...props }: any) => (
      <p className="mb-2 last:mb-0" {...props}>{children}</p>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic" {...props}>{children}</em>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside mb-2" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-2" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="mb-1" {...props}>{children}</li>
    ),
    code: ({ inline, children, ...props }: any) =>
      inline ? (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto mb-2">
          <code {...props}>{children}</code>
        </pre>
      ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2" {...props}>
        {children}
      </blockquote>
    ),
  };

  return (
    <div className={`group relative ${className}`}>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {displayContent}
        </ReactMarkdown>
      </div>
      
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 h-6 px-2 text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show more
            </>
          )}
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        title="Copy message"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};
