
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TextAlignType } from '../hooks/useStudyViewState';
import { Lightbulb } from 'lucide-react';
import './UnifiedContentRenderer.css';

interface UnifiedContentRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
}

export const UnifiedContentRenderer = ({
  content,
  fontSize,
  textAlign,
  className = ''
}: UnifiedContentRendererProps) => {
  console.log("🎨 UnifiedContentRenderer rendering:", {
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100),
    hasContent: !!content
  });

  if (!content || content.trim() === '') {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  // Check if content has AI enhancement markers
  const hasEnhancementMarkers = content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');

  if (!hasEnhancementMarkers) {
    // Regular markdown content - FORCE ReactMarkdown rendering
    console.log("🔍 Rendering regular markdown content");
    return (
      <div 
        className={`unified-content-renderer ${className}`}
        style={{ 
          fontSize: `${fontSize}px`,
          textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'justify'
        }}
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => (
              <h1 {...props} className="text-2xl font-bold text-gray-900 mb-4 mt-6 leading-tight">
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 {...props} className="text-xl font-bold text-gray-900 mb-3 mt-5 leading-tight">
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 {...props} className="text-lg font-bold text-gray-900 mb-3 mt-4 leading-tight">
                {children}
              </h3>
            ),
            h4: ({ children, ...props }) => (
              <h4 {...props} className="text-base font-bold text-gray-900 mb-2 mt-3 leading-tight">
                {children}
              </h4>
            ),
            p: ({ children, ...props }) => (
              <p {...props} className="text-gray-700 leading-relaxed mb-4">
                {children}
              </p>
            ),
            ul: ({ children, ...props }) => (
              <ul {...props} className="mb-4 space-y-2 pl-6 list-disc">
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol {...props} className="mb-4 space-y-2 pl-6 list-decimal">
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li {...props} className="text-gray-700 leading-relaxed marker:text-mint-500">
                {children}
              </li>
            ),
            strong: ({ children, ...props }) => (
              <strong {...props} className="font-semibold text-gray-900">
                {children}
              </strong>
            ),
            em: ({ children, ...props }) => (
              <em {...props} className="italic text-gray-700">
                {children}
              </em>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote {...props} className="border-l-4 border-mint-200 bg-mint-50/30 p-4 my-4 rounded-lg text-gray-600">
                {children}
              </blockquote>
            ),
            code: ({ children, ...props }) => (
              <code {...props} className="text-mint-700 bg-mint-50 px-2 py-1 rounded text-sm font-mono">
                {children}
              </code>
            ),
            pre: ({ children, ...props }) => (
              <pre {...props} className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-4 overflow-x-auto">
                {children}
              </pre>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Content with AI enhancement markers - parse and render with highlighting
  const parts = content.split(/(\[AI_ENHANCED\].*?\[\/AI_ENHANCED\])/gs);
  
  return (
    <div 
      className={`unified-content-renderer ${className}`}
      style={{ 
        fontSize: `${fontSize}px`,
        textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'justify'
      }}
    >
      {parts.map((part, index) => {
        if (part.match(/\[AI_ENHANCED\](.*?)\[\/AI_ENHANCED\]/s)) {
          // Extract enhanced content
          const enhancedText = part.replace(/\[AI_ENHANCED\](.*?)\[\/AI_ENHANCED\]/s, '$1').trim();
          
          if (!enhancedText) return null;
          
          // Enhanced content block with styling
          return (
            <div key={index} className="my-4 p-4 rounded-lg border-l-4 border-mint-400 bg-gradient-to-r from-mint-50 to-emerald-50">
              <div className="flex items-center gap-2 mb-3 opacity-75">
                <Lightbulb className="w-3 h-3 text-mint-600" />
                <span className="text-xs font-medium text-mint-700 uppercase tracking-wide">Enhanced</span>
              </div>
              
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children, ...props }) => (
                    <h1 {...props} className="text-lg font-bold text-gray-800 mb-2 mt-3">
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 {...props} className="text-base font-bold text-gray-800 mb-2 mt-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 {...props} className="text-sm font-bold text-gray-800 mb-2 mt-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }) => (
                    <p {...props} className="text-gray-700 leading-relaxed mb-3 text-sm">
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul {...props} className="mb-3 space-y-1 pl-4 list-disc">
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol {...props} className="mb-3 space-y-1 pl-4 list-decimal">
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li {...props} className="text-gray-700 leading-relaxed text-sm marker:text-mint-600">
                      {children}
                    </li>
                  ),
                  strong: ({ children, ...props }) => (
                    <strong {...props} className="font-semibold text-gray-800">
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em {...props} className="italic text-gray-700">
                      {children}
                    </em>
                  )
                }}
              >
                {enhancedText}
              </ReactMarkdown>
            </div>
          );
        } else if (part.trim()) {
          // Regular content - render as markdown
          return (
            <div key={index} className="mb-4">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children, ...props }) => (
                    <h1 {...props} className="text-2xl font-bold text-gray-900 mb-4 mt-6 leading-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 {...props} className="text-xl font-bold text-gray-900 mb-3 mt-5 leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 {...props} className="text-lg font-bold text-gray-900 mb-3 mt-4 leading-tight">
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 {...props} className="text-base font-bold text-gray-900 mb-2 mt-3 leading-tight">
                      {children}
                    </h4>
                  ),
                  p: ({ children, ...props }) => (
                    <p {...props} className="text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul {...props} className="mb-4 space-y-2 pl-6 list-disc">
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol {...props} className="mb-4 space-y-2 pl-6 list-decimal">
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li {...props} className="text-gray-700 leading-relaxed marker:text-mint-500">
                      {children}
                    </li>
                  ),
                  strong: ({ children, ...props }) => (
                    <strong {...props} className="font-semibold text-gray-900">
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em {...props} className="italic text-gray-700">
                      {children}
                    </em>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote {...props} className="border-l-4 border-mint-200 bg-mint-50/30 p-4 my-4 rounded-lg text-gray-600">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, ...props }) => (
                    <code {...props} className="text-mint-700 bg-mint-50 px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children, ...props }) => (
                    <pre {...props} className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-4 overflow-x-auto">
                      {children}
                    </pre>
                  )
                }}
              >
                {part}
              </ReactMarkdown>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
