
import { useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  // Process content to remove auto-generated titles and clean up HTML tags
  const processedContent = useMemo(() => {
    if (!content) return content;
    
    let processed = content;
    
    // Remove auto-generated title patterns if requested
    if (removeTitle) {
      const titlePatterns = [
        /^#+\s*Analysis of Notes on .+?\n/i,
        /^#+\s*Summary of .+?\n/i,
        /^#+\s*Key Points of .+?\n/i,
        /^#+\s*Improved .+?\n/i,
        /^#+\s*Markdown Version of .+?\n/i,
        /^#+\s*Formal vs Informal Language\n/i,
        /^#+\s*.+? vs .+?\n/i,
        /^Analysis of Notes on .+?\n/i,
        /^Summary of .+?\n/i,
        /^Key Points of .+?\n/i,
        /^Improved .+?\n/i,
        /^Markdown Version of .+?\n/i,
        /^Formal vs Informal Language\n/i,
        /^.+? vs .+?\n/i,
      ];
      
      titlePatterns.forEach(pattern => {
        processed = processed.replace(pattern, '');
      });
    }
    
    // Remove HTML tags that shouldn't be in markdown
    processed = processed.replace(/<p style="[^"]*">/g, '');
    processed = processed.replace(/<\/p>/g, '');
    processed = processed.replace(/<[^>]*>/g, '');
    
    // CRITICAL: Remove any remaining AI_ENHANCED tags that might have slipped through
    processed = processed.replace(/\[AI_ENHANCED\]/g, '');
    processed = processed.replace(/\[\/AI_ENHANCED\]/g, '');
    
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
        "prose-ul:space-y-1 prose-ol:space-y-1",
        "prose-li:leading-relaxed prose-li:ml-0",
        "prose-blockquote:border-l-mint-400 prose-blockquote:bg-mint-50/50 prose-blockquote:py-2",
        "prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-gray-100 prose-pre:border prose-pre:rounded-lg",
        "prose-table:border-collapse prose-table:border prose-table:border-gray-300",
        "prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2",
        "prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2",
        className
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children, ...props}) => (
            <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({children, ...props}) => (
            <h2 className="text-xl font-semibold mb-3 text-gray-800 mt-6 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({children, ...props}) => (
            <h3 className="text-lg font-medium mb-2 text-gray-700 mt-4" {...props}>
              {children}
            </h3>
          ),
          h4: ({children, ...props}) => (
            <h4 className="text-base font-medium mb-2 text-gray-700 mt-3" {...props}>
              {children}
            </h4>
          ),
          p: ({children, ...props}) => (
            <p className="mb-3 leading-relaxed text-gray-700 text-base" {...props}>
              {children}
            </p>
          ),
          ul: ({children, ...props}) => (
            <ul className="list-disc ml-6 mb-3 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({children, ...props}) => (
            <ol className="list-decimal ml-6 mb-3 space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({children, ...props}) => (
            <li className="text-gray-700 leading-relaxed pl-1" {...props}>
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
            <blockquote className="border-l-4 border-mint-400 pl-6 py-2 my-4 bg-mint-50/50 rounded-r-lg italic text-gray-700" {...props}>
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
            <hr className="my-6 border-gray-200" {...props} />
          ),
          a: ({children, ...props}) => (
            <a className="text-mint-600 hover:text-mint-700 underline underline-offset-2 hover:underline-offset-4 transition-all" {...props}>
              {children}
            </a>
          ),
          table: ({children, ...props}) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-gray-300 rounded-lg shadow-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({children, ...props}) => (
            <thead className="bg-gray-50" {...props}>
              {children}
            </thead>
          ),
          tbody: ({children, ...props}) => (
            <tbody className="bg-white" {...props}>
              {children}
            </tbody>
          ),
          th: ({children, ...props}) => (
            <th className="px-4 py-3 border border-gray-300 text-left font-semibold text-gray-900 bg-gray-100" {...props}>
              {children}
            </th>
          ),
          td: ({children, ...props}) => (
            <td className="px-4 py-3 border border-gray-300 text-gray-700" {...props}>
              {children}
            </td>
          ),
          // Handle mark elements for AI enhanced content
          mark: ({children, ...props}) => (
            <mark className="bg-mint-100 text-mint-800 px-1 rounded border-b-2 border-mint-300" {...props}>
              {children}
            </mark>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
