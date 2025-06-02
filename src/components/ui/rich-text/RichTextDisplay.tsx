
import { useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import { TextAlignType } from "@/components/notes/study/hooks/useStudyViewState";
import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  removeTitle?: boolean;
  className?: string;
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
        `prose prose-gray max-w-none ${textAlignClass[textAlign]}`,
        "prose-headings:scroll-mt-4 prose-headings:font-semibold",
        "prose-p:leading-relaxed prose-p:mb-4",
        "prose-ul:space-y-2 prose-ol:space-y-2",
        "prose-li:leading-relaxed",
        "prose-blockquote:border-l-mint-400 prose-blockquote:bg-mint-50/50 prose-blockquote:py-2",
        "prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-gray-100 prose-pre:border prose-pre:rounded-lg",
        className
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      <ReactMarkdown
        components={{
          h1: ({children, ...props}) => (
            <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({children, ...props}) => (
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 mt-8 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({children, ...props}) => (
            <h3 className="text-xl font-medium mb-3 text-gray-700 mt-6" {...props}>
              {children}
            </h3>
          ),
          h4: ({children, ...props}) => (
            <h4 className="text-lg font-medium mb-2 text-gray-700 mt-4" {...props}>
              {children}
            </h4>
          ),
          p: ({children, ...props}) => (
            <p className="mb-4 leading-relaxed text-gray-700 text-base" {...props}>
              {children}
            </p>
          ),
          ul: ({children, ...props}) => (
            <ul className="list-disc list-inside mb-4 space-y-2 pl-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({children, ...props}) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 pl-2" {...props}>
              {children}
            </ol>
          ),
          li: ({children, ...props}) => (
            <li className="text-gray-700 leading-relaxed" {...props}>
              {children}
            </li>
          ),
          strong: ({children, ...props}) => (
            <strong className="font-semibold text-gray-900" {...props}>
              {children}
            </strong>
          ),
          em: ({children, ...props}) => (
            <em className="italic text-gray-700" {...props}>
              {children}
            </em>
          ),
          blockquote: ({children, ...props}) => (
            <blockquote className="border-l-4 border-mint-400 pl-6 py-2 my-6 bg-mint-50/50 rounded-r-lg italic text-gray-700" {...props}>
              {children}
            </blockquote>
          ),
          code: ({children, ...props}) => (
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border" {...props}>
              {children}
            </code>
          ),
          pre: ({children, ...props}) => (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm border shadow-sm" {...props}>
              {children}
            </pre>
          ),
          hr: ({...props}) => (
            <hr className="my-8 border-gray-200" {...props} />
          ),
          a: ({children, ...props}) => (
            <a className="text-mint-600 hover:text-mint-700 underline underline-offset-2 hover:underline-offset-4 transition-all" {...props}>
              {children}
            </a>
          ),
          table: ({children, ...props}) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border border-gray-200 rounded-lg" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({children, ...props}) => (
            <th className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-left font-semibold text-gray-900" {...props}>
              {children}
            </th>
          ),
          td: ({children, ...props}) => (
            <td className="px-4 py-2 border-b border-gray-100 text-gray-700" {...props}>
              {children}
            </td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
