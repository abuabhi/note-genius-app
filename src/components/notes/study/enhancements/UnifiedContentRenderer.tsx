
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { TextAlignType } from '../hooks/useStudyViewState';
import { processAIEnhancedContent, cleanMarkdownContent } from './utils/contentProcessing';
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
  console.log("🎨 UnifiedContentRenderer:", {
    contentLength: content?.length || 0,
    isMarkdown,
    hasAIEnhancedTags: content?.includes('[AI_ENHANCED]')
  });

  if (!content || content.trim() === '') {
    return <div className="text-muted-foreground italic">No content available</div>;
  }

  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign === 'left' ? 'left' as const : 
             textAlign === 'center' ? 'center' as const : 
             'justify' as const
  };

  // SIMPLIFIED: Plain text rendering for original content
  if (!isMarkdown) {
    return (
      <div 
        className={`unified-plain-text ${className}`}
        style={containerStyle}
      >
        {content}
      </div>
    );
  }

  // SIMPLIFIED: Markdown rendering for all AI-enhanced content
  const processedContent = processAIEnhancedContent(cleanMarkdownContent(content));
  
  console.log("🚀 Rendering as markdown:", {
    originalLength: content.length,
    processedLength: processedContent.length,
    hasAIBlocks: processedContent.includes('<div class="ai-enhanced-block">')
  });

  const markdownComponents = {
    // Headers with consistent spacing
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground border-b border-border pb-2 first:mt-0" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-semibold mb-3 mt-5 text-foreground first:mt-0" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-medium mb-2 mt-4 text-foreground first:mt-0" {...props} />
    ),
    
    // Paragraphs with proper spacing
    p: ({ node, ...props }: any) => (
      <p className="mb-4 leading-relaxed text-foreground last:mb-0" {...props} />
    ),
    
    // FIXED: Enhanced list rendering with forced visibility
    ul: ({ node, ...props }: any) => (
      <ul className="enhanced-list enhanced-ul my-4 ml-6 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="enhanced-list enhanced-ol my-4 ml-6 space-y-1" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="enhanced-list-item leading-relaxed text-foreground" {...props} />
    ),
    
    // Text formatting
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-foreground" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-foreground" {...props} />
    ),
    
    // Code blocks
    code: ({ node, inline, ...props }: any) =>
      inline ? (
        <code className="relative rounded bg-muted px-2 py-1 font-mono text-sm" {...props} />
      ) : (
        <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-4">
          <code className="font-mono text-sm" {...props} />
        </pre>
      ),
    
    // AI_ENHANCED blocks
    div: ({ node, className: nodeClassName, ...props }: any) => {
      if (nodeClassName === 'ai-enhanced-block') {
        console.log("🎯 Rendering AI_ENHANCED block");
        return <div className="ai-enhanced-block" {...props} />;
      }
      return <div className={nodeClassName} {...props} />;
    }
  };
  
  return (
    <div 
      className={`unified-markdown-content prose prose-gray max-w-none dark:prose-invert ${className}`}
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
};
