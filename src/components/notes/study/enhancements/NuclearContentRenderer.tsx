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
    textAlign,
    rawContentPreview: content?.substring(0, 200)
  });

  // Validate content
  if (!validateContentForRendering(content)) {
    console.log("❌ NUCLEAR RENDERER: Content validation failed");
    return (
      <div className="nuclear-content-container text-muted-foreground italic p-4">
        No content available
      </div>
    );
  }

  // Process content through unified processor
  const processedData = processContentForRendering(content);
  
  console.log("✅ NUCLEAR RENDERER: Content processed successfully:", {
    originalLength: content.length,
    processedLength: processedData.content.length,
    metadata: processedData.metadata,
    processedPreview: processedData.content.substring(0, 200)
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
    
    // Text formatting with enriched content highlighting - UPDATED FOR NEW APPROACH
    strong: ({ children, ...props }: any) => {
      const childrenString = React.Children.toArray(children).join('');
      
      // Check if this is enriched content marker (old format fallback)
      if (childrenString === '[ENRICHED]') {
        return <span className="enriched-marker enriched-start" {...props}>🔥 Added Content:</span>;
      }
      if (childrenString === '[/ENRICHED]') {
        return <span className="enriched-marker enriched-end" {...props}></span>;
      }
      
      return <strong className="nuclear-strong" {...props}>{children}</strong>;
    },
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
    
    // AI Enhanced blocks - convert markdown sections back to styled blocks
    blockquote: ({ children, ...props }: any) => {
      // Check if this is an AI enhanced section
      const childrenString = React.Children.toArray(children).join('');
      if (childrenString.includes('✨ AI Enhanced Content:')) {
        console.log("🎯 NUCLEAR: Rendering AI Enhanced blockquote");
        return (
          <div className="ai-enhanced-block nuclear-ai-block" {...props}>
            {children}
          </div>
        );
      }
      return <blockquote className="nuclear-blockquote" {...props}>{children}</blockquote>;
    },
    
    // Handle enriched content spans - CRITICAL for new enrichment
    span: ({ className: spanClassName, children, ...props }: any) => {
      if (spanClassName === 'enriched-content') {
        console.log("🔥 NUCLEAR: Rendering enriched content span");
        return (
          <span className="enriched-content" {...props}>
            {children}
          </span>
        );
      }
      return <span className={spanClassName} {...props}>{children}</span>;
    },
    
    // Handle divs (in case any slip through)
    div: ({ className: divClassName, children, ...props }: any) => {
      if (divClassName === 'ai-enhanced-block') {
        console.log("🎯 NUCLEAR: Rendering AI Enhanced div block");
        return (
          <div className="ai-enhanced-block nuclear-ai-block" {...props}>
            {children}
          </div>
        );
      }
      if (divClassName === 'enriched-content') {
        console.log("🔥 NUCLEAR: Rendering enriched content div");
        return (
          <div className="enriched-content" {...props}>
            {children}
          </div>
        );
      }
      return <div className={`nuclear-div ${divClassName || ''}`} {...props}>{children}</div>;
    },
    
    // Handle enriched content sections - NEW APPROACH FOR SECTION IDENTIFIERS
    hr: ({ ...props }: any) => {
      // Check if this is an enriched content section marker
      const nextSibling = props?.node?.nextSibling;
      const prevSibling = props?.node?.previousSibling;
      
      // This is a placeholder for now - the real magic happens in our custom processing
      return <hr className="nuclear-hr" {...props} />;
    }
  };

  // NUCLEAR: Process enriched content sections BEFORE passing to ReactMarkdown
  const processEnrichedSections = (content: string): string => {
    console.log("🔥 NUCLEAR: Processing enriched sections:", {
      hasEnrichedMarkers: content.includes('---ENRICHED-START---'),
      contentPreview: content.substring(0, 200)
    });

    // Split content by enriched markers and wrap sections
    const sections = content.split(/(---ENRICHED-START---|---ENRICHED-END---)/);
    let processedContent = '';
    let inEnrichedSection = false;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      if (section === '---ENRICHED-START---') {
        inEnrichedSection = true;
        processedContent += '\n\n<div class="enriched-content-section">\n\n**🔥 Enriched Content:**\n\n';
      } else if (section === '---ENRICHED-END---') {
        inEnrichedSection = false;
        processedContent += '\n\n</div>\n\n';
      } else {
        if (inEnrichedSection) {
          // Content inside enriched section - add some styling hints
          processedContent += section;
        } else {
          // Regular content
          processedContent += section;
        }
      }
    }

    console.log("✅ NUCLEAR: Enriched sections processed:", {
      originalLength: content.length,
      processedLength: processedContent.length,
      hasEnrichedDivs: processedContent.includes('enriched-content-section')
    });

    return processedContent;
  };

  // Process the content for enriched sections
  const finalContent = processEnrichedSections(processedData.content);

  console.log("🎨 NUCLEAR RENDERER: About to render with ReactMarkdown:", {
    hasProcessedContent: !!finalContent,
    containerStyle,
    componentsCount: Object.keys(nuclearMarkdownComponents).length,
    finalContentPreview: finalContent.substring(0, 200)
  });

  return (
    <div 
      className={`nuclear-content-container ${className}`.trim()}
      style={containerStyle}
    >
      <ReactMarkdown
        children={finalContent}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={nuclearMarkdownComponents}
      />
    </div>
  );
};
