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
  // Check if content has AI enhancement markers
  const hasEnhancementMarkers = content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');

  if (!hasEnhancementMarkers) {
    // Regular markdown content without AI markers
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
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-8 leading-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-900 mb-5 mt-7 leading-tight">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6 leading-tight">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-medium text-gray-900 mb-3 mt-5 leading-tight">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 leading-7 mb-5 text-base">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-6 space-y-2 pl-6">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-6 space-y-2 pl-6">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-700 mb-2 leading-7 marker:text-mint-500 marker:font-medium">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="text-gray-900 font-semibold">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="text-gray-700 italic">
                {children}
              </em>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-mint-200 bg-mint-50/30 p-4 my-6 rounded-lg text-gray-600">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="text-mint-700 bg-mint-50 px-2 py-1 rounded text-sm font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-6 overflow-x-auto">
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
          
          // Determine enhancement type for styling
          const isStudyTip = enhancedText.includes('Study Tip') || enhancedText.includes('Remember:') || enhancedText.includes('Tip:');
          const isExample = enhancedText.includes('Example:') || enhancedText.includes('Real-World');
          
          // Choose styling based on enhancement type
          let containerClasses = "my-5 p-5 rounded-lg border-l-4 relative overflow-hidden transition-all duration-200 hover:shadow-sm";
          let iconElement = null;
          
          if (isStudyTip) {
            containerClasses += " bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400";
            iconElement = (
              <div className="flex items-center gap-2 mb-3 opacity-75">
                <div className="flex items-center justify-center w-5 h-5 bg-white/60 rounded-full">
                  <Lightbulb className="w-3 h-3 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Study Tip</span>
              </div>
            );
          } else if (isExample) {
            containerClasses += " bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400";
            iconElement = (
              <div className="flex items-center gap-2 mb-3 opacity-75">
                <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Example</span>
              </div>
            );
          } else {
            containerClasses += " bg-gradient-to-r from-mint-50 to-emerald-50 border-mint-400";
            iconElement = (
              <div className="flex items-center gap-2 mb-3 opacity-75">
                <span className="text-xs font-medium text-mint-700 uppercase tracking-wide">Enhanced</span>
              </div>
            );
          }
          
          return (
            <div key={index} className={containerClasses}>
              {iconElement}
              
              {/* Enhanced content with proper markdown rendering */}
              <div className="relative">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-lg font-semibold text-gray-800 mb-3 mt-4 leading-tight">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-medium text-gray-800 mb-3 mt-4 leading-tight">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-medium text-gray-800 mb-2 mt-3 leading-tight">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-sm font-medium text-gray-800 mb-2 mt-3 leading-tight">
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 leading-6 mb-3 text-sm">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 space-y-1 pl-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 space-y-1 pl-4">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-700 mb-1 leading-6 text-sm marker:text-mint-600 marker:font-medium">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-gray-800 font-semibold">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-gray-700 italic">
                        {children}
                      </em>
                    )
                  }}
                >
                  {enhancedText}
                </ReactMarkdown>
              </div>
              
              {/* Subtle decorative element */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full pointer-events-none"></div>
            </div>
          );
        } else if (part.trim()) {
          // Regular content - render as markdown
          return (
            <div key={index} className="mb-4">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-8 leading-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-gray-900 mb-5 mt-7 leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6 leading-tight">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-medium text-gray-900 mb-3 mt-5 leading-tight">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-7 mb-5 text-base">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-6 space-y-2 pl-6">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-6 space-y-2 pl-6">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700 mb-2 leading-7 marker:text-mint-500 marker:font-medium">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-gray-900 font-semibold">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-gray-700 italic">
                      {children}
                    </em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-mint-200 bg-mint-50/30 p-4 my-6 rounded-lg text-gray-600">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="text-mint-700 bg-mint-50 px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-6 overflow-x-auto">
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
