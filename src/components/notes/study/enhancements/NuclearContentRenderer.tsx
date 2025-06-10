
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { TextAlignType } from '../hooks/useStudyViewState';
import { processContentForRendering, validateContentForRendering } from './utils/unifiedContentProcessor';
import './NuclearContentRenderer.css';

interface NuclearContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
}

/**
 * NUCLEAR REWRITE: Single, bulletproof content renderer
 * This is the ONLY component that should render content
 */
export const NuclearContentRenderer = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = ''
}: NuclearContentRendererProps) => {
  console.log("🚀 NUCLEAR RENDERER: Starting render process:", {
    contentLength: content?.length || 0,
    fontSize,
    textAlign
  });

  // Validate content
  if (!validateContentForRendering(content)) {
    return (
      <div className="nuclear-content-container text-muted-foreground italic p-4">
        No content available
      </div>
    );
  }

  // Process content through unified processor
  const processedData = processContentForRendering(content);
  
  console.log("✅ NUCLEAR RENDERER: Content processed:", {
    originalLength: content.length,
    processedLength: processedData.content.length,
    metadata: processedData.metadata
  });

  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign === 'left' ? 'left' as const : 
             textAlign === 'center' ? 'center' as const : 
             'justify' as const
  };

  // NUCLEAR: Custom markdown components with maximum specificity
  const nuclearMarkdownComponents = {
    // Headers with forced styling
    h1: ({ children, ...props }: any) => (
      <h1 className="nuclear-header nuclear-h1" {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="nuclear-header nuclear-h2" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="nuclear-header nuclear-h3" {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className="nuclear-header nuclear-h4" {...props}>{children}</h4>
    ),
    h5: ({ children, ...props }: any) => (
      <h5 className="nuclear-header nuclear-h5" {...props}>{children}</h5>
    ),
    h6: ({ children, ...props }: any) => (
      <h6 className="nuclear-header nuclear-h6" {...props}>{children}</h6>
    ),
    
    // Paragraphs with forced styling
    p: ({ children, ...props }: any) => (
      <p className="nuclear-paragraph" {...props}>{children}</p>
    ),
    
    // Lists with FORCED bullet points
    ul: ({ children, ...props }: any) => (
      <ul className="nuclear-list nuclear-ul" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="nuclear-list nuclear-ol" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="nuclear-list-item" {...props}>{children}</li>
    ),
    
    // Text formatting
    strong: ({ children, ...props }: any) => (
      <strong className="nuclear-strong" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="nuclear-em" {...props}>{children}</em>
    ),
    
    // Code blocks
    code: ({ inline, children, ...props }: any) =>
      inline ? (
        <code className="nuclear-code-inline" {...props}>{children}</code>
      ) : (
        <pre className="nuclear-code-block">
          <code className="nuclear-code" {...props}>{children}</code>
        </pre>
      ),
    
    // AI Enhanced blocks
    div: ({ className: divClassName, children, ...props }: any) => {
      if (divClassName === 'ai-enhanced-block') {
        console.log("🎯 NUCLEAR: Rendering AI Enhanced block");
        return (
          <div className="ai-enhanced-block nuclear-ai-block" {...props}>
            {children}
          </div>
        );
      }
      return <div className={`nuclear-div ${divClassName || ''}`} {...props}>{children}</div>;
    }
  };

  return (
    <div 
      className={`nuclear-content-container ${className}`.trim()}
      style={containerStyle}
    >
      <ReactMarkdown
        children={processedData.content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={nuclearMarkdownComponents}
      />
    </div>
  );
};
