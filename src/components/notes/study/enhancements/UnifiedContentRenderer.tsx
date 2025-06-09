
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { TextAlignType } from '../hooks/useStudyViewState';
import './UnifiedContentRenderer.css';

interface UnifiedContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
  isMarkdown?: boolean;
}

export const UnifiedContentRenderer = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = '',
  isMarkdown = true
}: UnifiedContentRendererProps) => {
  console.log("🎨 UnifiedContentRenderer rendering:", {
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100),
    hasContent: !!content,
    isMarkdown,
    hasAIEnhancedTags: content?.includes('[AI_ENHANCED]')
  });

  if (!content || content.trim() === '') {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  // ENHANCED: Better processing of AI_ENHANCED blocks
  const processAIEnhancedContent = (rawContent: string): string => {
    let processed = rawContent
      .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced">')
      .replace(/\[\/AI_ENHANCED\]/g, '</div>');
    
    console.log("🔧 AI_ENHANCED processing:", {
      originalHadTags: rawContent.includes('[AI_ENHANCED]'),
      processedHasDivs: processed.includes('<div class="ai-enhanced">'),
      tagCount: (rawContent.match(/\[AI_ENHANCED\]/g) || []).length
    });
    
    return processed;
  };

  // ENHANCED: Better list and content spacing
  const ensureProperListSpacing = (content: string): string => {
    return content
      // Add space before bullet lists
      .replace(/\n([-*+])/g, '\n\n$1')
      // Add space before numbered lists
      .replace(/\n(\d+\.)/g, '\n\n$1')
      // Add space before headings
      .replace(/\n(#{1,6}\s)/g, '\n\n$1')
      // Remove excessive line breaks
      .replace(/\n\n\n+/g, '\n\n')
      // Ensure list items have proper spacing
      .replace(/([-*+]\s.+)\n([-*+]\s)/g, '$1\n\n$2')
      .replace(/(\d+\.\s.+)\n(\d+\.\s)/g, '$1\n\n$2');
  };

  // ENHANCED: Custom components with better styling
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 border-b border-gray-200 pb-2 leading-tight" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-semibold mb-3 mt-5 text-gray-800 leading-tight" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-medium mb-3 mt-4 text-gray-800 leading-tight" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-base font-medium mb-2 mt-3 text-gray-700 leading-tight" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="mb-4 leading-relaxed text-gray-700 text-base" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc list-outside my-4 space-y-2 pl-6 ml-2" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal list-outside my-4 space-y-2 pl-6 ml-2" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="mb-2 text-gray-700 leading-relaxed pl-1 list-item" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-gray-900" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-gray-700" {...props} />
    ),
    code: ({ node, inline, ...props }: any) =>
      inline ? (
        <code className="bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 font-mono text-sm" {...props} />
      ) : (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
          <code className="text-sm font-mono text-gray-800" {...props} />
        </pre>
      ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-mint-300 pl-4 italic text-gray-600 my-4 bg-mint-50 py-3 rounded-r" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-6 border-gray-200" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-mint-600 hover:text-mint-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    div: ({ node, className: nodeClassName, ...props }: any) => {
      // Handle AI_ENHANCED blocks specially
      if (nodeClassName === 'ai-enhanced') {
        console.log("🎯 Rendering AI_ENHANCED block");
        return <div className="ai-enhanced" {...props} />;
      }
      return <div className={nodeClassName} {...props} />;
    }
  };

  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign === 'left' ? 'left' as const : 
             textAlign === 'center' ? 'center' as const : 
             'justify' as const
  };

  if (isMarkdown) {
    const processedContent = ensureProperListSpacing(processAIEnhancedContent(content));
    
    console.log("🚀 Rendering as markdown:", {
      originalLength: content.length,
      processedLength: processedContent.length,
      hasAIBlocks: processedContent.includes('<div class="ai-enhanced">')
    });
    
    return (
      <div 
        className={`prose prose-gray max-w-none ${className}`}
        style={containerStyle}
      >
        <ReactMarkdown
          children={processedContent}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        />
      </div>
    );
  }

  // Fallback for plain text content
  console.log("📝 Rendering as plain text");
  return (
    <div 
      className={`text-base whitespace-pre-wrap ${className}`}
      style={containerStyle}
    >
      {content}
    </div>
  );
};
