import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { TextAlignType } from './hooks/useStudyViewState';
import './SimpleContentRenderer.css';

interface SimpleContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
}

// Simple detection: if content has HTML tags with style attributes, render as HTML
const hasHTMLContent = (content: string): boolean => {
  console.log("🔍 CHECKING CONTENT:", content.substring(0, 200));
  const hasHTML = content.includes('<div') || content.includes('<span') || content.includes('style=');
  console.log("🔍 HAS HTML:", hasHTML);
  return hasHTML;
};

export const SimpleContentRenderer: React.FC<SimpleContentRendererProps> = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = ''
}) => {
  if (!content || content.trim().length === 0) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign,
    lineHeight: 1.6
  };

  const containerClass = `simple-content ${className}`;

  // If content has HTML styling, render as HTML
  if (hasHTMLContent(content)) {
    return (
      <div 
        className={containerClass}
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise render as markdown
  return (
    <div className={containerClass} style={containerStyle}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="simple-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="simple-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="simple-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="simple-h4">{children}</h4>,
          h5: ({ children }) => <h5 className="simple-h5">{children}</h5>,
          h6: ({ children }) => <h6 className="simple-h6">{children}</h6>,
          p: ({ children }) => <p className="simple-p">{children}</p>,
          ul: ({ children }) => <ul className="simple-ul">{children}</ul>,
          ol: ({ children }) => <ol className="simple-ol">{children}</ol>,
          li: ({ children }) => <li className="simple-li">{children}</li>,
          strong: ({ children }) => <strong className="simple-strong">{children}</strong>,
          em: ({ children }) => <em className="simple-em">{children}</em>,
          code: ({ children }) => <code className="simple-code">{children}</code>,
          pre: ({ children }) => <pre className="simple-pre">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="simple-blockquote">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
