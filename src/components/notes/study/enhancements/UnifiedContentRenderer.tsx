
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TextAlignType } from '../hooks/useStudyViewState';

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
  isMarkdown = false
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

  if (!isMarkdown) {
    return (
      <div 
        className={`text-base whitespace-pre-wrap ${className}`}
        style={{ 
          fontSize: `${fontSize}px`,
          textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'justify'
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div 
      className={`unified-content-renderer ${className}`}
      style={{ 
        fontSize: `${fontSize}px`,
        textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'justify'
      }}
    >
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        linkTarget="_blank"
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-3 mb-1" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-2 mb-1" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
          code: ({node, inline, ...props}) =>
            inline ? (
              <code className="bg-gray-100 rounded px-1 font-mono text-sm" {...props} />
            ) : (
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
                <code {...props} />
              </pre>
            ),
        }}
      />
    </div>
  );
};
