
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
    return <div className="text-muted-foreground italic">No content available</div>;
  }

  // ENHANCED: Better processing of AI_ENHANCED blocks
  const processAIEnhancedContent = (rawContent: string): string => {
    let processed = rawContent
      .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced-block">')
      .replace(/\[\/AI_ENHANCED\]/g, '</div>');
    
    console.log("🔧 AI_ENHANCED processing:", {
      originalHadTags: rawContent.includes('[AI_ENHANCED]'),
      processedHasDivs: processed.includes('<div class="ai-enhanced-block">'),
      tagCount: (rawContent.match(/\[AI_ENHANCED\]/g) || []).length
    });
    
    return processed;
  };

  // ENHANCED: Better content spacing and structure
  const enhanceContentSpacing = (content: string): string => {
    return content
      // Ensure proper spacing before lists
      .replace(/\n([-*+])/g, '\n\n$1')
      .replace(/\n(\d+\.)/g, '\n\n$1')
      // Ensure proper spacing before headings
      .replace(/\n(#{1,6}\s)/g, '\n\n$1')
      // Clean up excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Ensure paragraphs have proper spacing
      .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')
      .trim();
  };

  // ENHANCED: Improved markdown components with better styling
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold mb-6 mt-8 text-foreground border-b border-border pb-3 first:mt-0" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-semibold mb-4 mt-6 text-foreground first:mt-0" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-medium mb-3 mt-5 text-foreground first:mt-0" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-base font-medium mb-2 mt-4 text-foreground first:mt-0" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="mb-4 leading-7 text-foreground last:mb-0" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="my-6 ml-6 list-disc space-y-2 marker:text-muted-foreground" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="my-6 ml-6 list-decimal space-y-2 marker:text-muted-foreground" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="leading-7 text-foreground" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-foreground" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-foreground" {...props} />
    ),
    code: ({ node, inline, ...props }: any) =>
      inline ? (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium" {...props} />
      ) : (
        <pre className="mb-4 mt-6 overflow-x-auto rounded-lg bg-muted p-4">
          <code className="relative rounded font-mono text-sm" {...props} />
        </pre>
      ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="mt-6 border-l-4 border-border pl-6 italic text-muted-foreground" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-8 border-border" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a className="font-medium text-primary underline underline-offset-4 hover:text-primary/80" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    div: ({ node, className: nodeClassName, ...props }: any) => {
      // Handle AI_ENHANCED blocks specially
      if (nodeClassName === 'ai-enhanced-block') {
        console.log("🎯 Rendering AI_ENHANCED block");
        return <div className="ai-enhanced-block" {...props} />;
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
    const processedContent = enhanceContentSpacing(processAIEnhancedContent(content));
    
    console.log("🚀 Rendering as markdown:", {
      originalLength: content.length,
      processedLength: processedContent.length,
      hasAIBlocks: processedContent.includes('<div class="ai-enhanced-block">')
    });
    
    return (
      <div 
        className={`prose prose-gray max-w-none dark:prose-invert ${className}`}
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
      className={`whitespace-pre-wrap leading-7 text-foreground ${className}`}
      style={containerStyle}
    >
      {content}
    </div>
  );
};
