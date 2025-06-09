
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
    isMarkdown
  });

  if (!content || content.trim() === '') {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  // Pre-process content to handle AI_ENHANCED blocks
  const processAIEnhancedContent = (rawContent: string): string => {
    return rawContent
      .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced">')
      .replace(/\[\/AI_ENHANCED\]/g, '</div>');
  };

  // Custom components for react-markdown
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 border-b border-gray-200 pb-2" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-semibold mb-3 mt-5 text-gray-800" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-base font-medium mb-2 mt-3 text-gray-700" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="mb-3 leading-relaxed text-gray-700" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc list-inside my-3 space-y-1 pl-2" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal list-inside my-3 space-y-1 pl-2" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="mb-1 text-gray-700" {...props} />
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
      <blockquote className="border-l-4 border-mint-300 pl-4 italic text-gray-600 my-4 bg-mint-50 py-2 rounded-r" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-6 border-gray-200" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-mint-600 hover:text-mint-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
    )
  };

  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign === 'left' ? 'left' as const : 
             textAlign === 'center' ? 'center' as const : 
             'justify' as const
  };

  if (isMarkdown) {
    const processedContent = processAIEnhancedContent(content);
    
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
  return (
    <div 
      className={`text-base whitespace-pre-wrap ${className}`}
      style={containerStyle}
    >
      {content}
    </div>
  );
};
