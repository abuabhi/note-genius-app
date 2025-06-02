
import { useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import { TextAlignType } from "@/components/notes/study/hooks/useStudyViewState";
import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  removeTitle?: boolean; // New prop to remove auto-generated titles
  className?: string; // Add className prop
}

export const RichTextDisplay = ({ 
  content, 
  fontSize = 16, 
  textAlign = 'left',
  removeTitle = false,
  className 
}: RichTextDisplayProps) => {
  // Process content to remove auto-generated titles if requested
  const processedContent = useMemo(() => {
    if (!removeTitle || !content) return content;
    
    // Remove common auto-generated title patterns
    const titlePatterns = [
      /^#+\s*Summary of .+?\n/i,
      /^#+\s*Key Points of .+?\n/i,
      /^#+\s*Improved .+?\n/i,
      /^#+\s*Markdown Version of .+?\n/i,
      /^Summary of .+?\n/i,
      /^Key Points of .+?\n/i,
      /^Improved .+?\n/i,
      /^Markdown Version of .+?\n/i,
    ];
    
    let processed = content;
    titlePatterns.forEach(pattern => {
      processed = processed.replace(pattern, '');
    });
    
    return processed.trim();
  }, [content, removeTitle]);

  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  return (
    <div 
      className={cn(
        `prose prose-gray max-w-none p-4 ${textAlignClass[textAlign]}`,
        className
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      <ReactMarkdown
        components={{
          h1: ({children, ...props}) => (
            <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props}>
              {children}
            </h1>
          ),
          h2: ({children, ...props}) => (
            <h2 className="text-xl font-semibold mb-3 text-gray-800" {...props}>
              {children}
            </h2>
          ),
          h3: ({children, ...props}) => (
            <h3 className="text-lg font-medium mb-2 text-gray-700" {...props}>
              {children}
            </h3>
          ),
          p: ({children, ...props}) => (
            <p className="mb-3 leading-relaxed text-gray-600" {...props}>
              {children}
            </p>
          ),
          ul: ({children, ...props}) => (
            <ul className="list-disc list-inside mb-3 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({children, ...props}) => (
            <ol className="list-decimal list-inside mb-3 space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({children, ...props}) => (
            <li className="text-gray-600" {...props}>
              {children}
            </li>
          ),
          strong: ({children, ...props}) => (
            <strong className="font-semibold text-gray-800" {...props}>
              {children}
            </strong>
          ),
          em: ({children, ...props}) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
          blockquote: ({children, ...props}) => (
            <blockquote className="border-l-4 border-mint-300 pl-4 italic text-gray-600 my-4" {...props}>
              {children}
            </blockquote>
          ),
          code: ({children, ...props}) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ),
          pre: ({children, ...props}) => (
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm" {...props}>
              {children}
            </pre>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
