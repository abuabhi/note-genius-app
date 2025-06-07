
import { useState } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { EnhancedContentRenderer } from "./EnhancedContentRenderer";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, FileText, Target, List, Sparkles, Code } from "lucide-react";
import { LoadingAnimations } from "./LoadingAnimations";
import { EnhancementContentType } from "./EnhancementSelector";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EnhancementDisplayPanelProps {
  note: Note;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => void;
  onCancelEnhancement?: () => void;
  className?: string;
}

export const EnhancementDisplayPanel = ({
  note,
  contentType,
  fontSize,
  textAlign,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement,
  className
}: EnhancementDisplayPanelProps) => {
  const [retryLoading, setRetryLoading] = useState(false);

  const getContent = () => {
    switch (contentType) {
      case 'original':
        return note.content || note.description || "";
      case 'summary':
        return note.summary || "";
      case 'keyPoints':
        return note.key_points || "";
      case 'improved':
        return note.improved_content || "";
      case 'markdown':
        return note.markdown_content || "";
      default:
        return "";
    }
  };

  const getContentInfo = () => {
    switch (contentType) {
      case 'original':
        return {
          title: "Original Content",
          icon: FileText,
          description: "Your original note content",
          color: "text-mint-600",
          isMarkdown: false
        };
      case 'summary':
        return {
          title: "Summary",
          icon: Target,
          description: "AI-generated concise summary",
          color: "text-mint-600",
          isMarkdown: true
        };
      case 'keyPoints':
        return {
          title: "Key Points",
          icon: List,
          description: "Essential highlights extracted",
          color: "text-mint-600",
          isMarkdown: true
        };
      case 'improved':
        return {
          title: "Improved Clarity",
          icon: Sparkles,
          description: "Enhanced readability version",
          color: "text-mint-600",
          isMarkdown: true
        };
      case 'markdown':
        return {
          title: "Original++",
          icon: Code,
          description: "Structured markdown format",
          color: "text-mint-600",
          isMarkdown: true
        };
      default:
        return {
          title: "",
          icon: FileText,
          description: "",
          color: "text-mint-600",
          isMarkdown: false
        };
    }
  };

  // Clean content function for pure markdown without AI markers
  const cleanMarkdownContent = (content: string): string => {
    if (!content) return "";
    
    // Remove HTML tags and decode HTML entities
    let cleaned = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Remove [AI_ENHANCED] markers for clean markdown
    cleaned = cleaned.replace(/\[AI_ENHANCED\]/g, '').replace(/\[\/AI_ENHANCED\]/g, '');
    
    // Fix line breaks and paragraphs - ensure double line breaks for proper markdown parsing
    cleaned = cleaned
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
    
    return cleaned;
  };

  // Process key points to ensure proper bullet formatting
  const processKeyPoints = (content: string): string => {
    if (!content) return "";
    
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return lines.map(line => {
      // If line doesn't start with bullet or number, add bullet
      if (!line.match(/^[\-\*\+\d\.]/)) {
        return `• ${line}`;
      }
      // Convert dashes to bullets for consistency
      if (line.startsWith('-')) {
        return line.replace(/^-\s*/, '• ');
      }
      return line;
    }).join('\n\n');
  };

  const content = getContent();
  const contentInfo = getContentInfo();
  const Icon = contentInfo.icon;

  // Calculate reading stats
  const wordCount = content ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words/minute

  const handleRetry = async (enhancementType: string) => {
    if (!onRetryEnhancement) return;
    
    setRetryLoading(true);
    try {
      await onRetryEnhancement(enhancementType);
    } finally {
      setRetryLoading(false);
    }
  };

  // Check if content contains AI enhancement markers
  const hasEnhancementMarkers = content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');

  // Show loading state with tab-specific loading animation
  if (isLoading) {
    return (
      <div className={cn("flex flex-col bg-white", className)}>
        <div className="border-b border-border py-3 px-4 bg-gradient-to-r from-mint-50/30 to-white h-[73px] flex items-center">
          <div className="flex items-center space-x-3">
            <Icon className={cn("h-5 w-5 animate-pulse", contentInfo.color)} />
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{contentInfo.title}</h2>
              <p className="text-xs text-gray-500">Generating content...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-12">
          <LoadingAnimations />
        </div>
      </div>
    );
  }

  // Show empty state with retry option for non-original content
  if (!content && contentType !== 'original') {
    return (
      <div className={cn("flex flex-col bg-white", className)}>
        <div className="border-b border-border py-3 px-4 bg-gradient-to-r from-mint-50/30 to-white h-[73px] flex items-center">
          <div className="flex items-center space-x-3">
            <Icon className={cn("h-5 w-5", contentInfo.color)} />
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{contentInfo.title}</h2>
              <p className="text-xs text-gray-500">{contentInfo.description}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-mint-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="h-8 w-8 text-mint-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {contentInfo.title.toLowerCase()} available</h3>
            <p className="text-sm text-gray-500 mb-6">
              Generate AI-enhanced content to see {contentInfo.title.toLowerCase()} here
            </p>
            {onRetryEnhancement && (
              <Button
                onClick={() => handleRetry(getEnhancementTypeFromContent(contentType))}
                disabled={retryLoading}
                variant="outline"
                size="sm"
                className="text-mint-600 hover:text-mint-700 border-mint-200 hover:border-mint-300 bg-mint-50 hover:bg-mint-100"
              >
                {retryLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2 text-mint-600" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2 text-mint-600" />
                )}
                Generate {contentInfo.title}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced markdown styles with proper spacing and formatting
  const markdownClasses = `
    prose prose-mint max-w-none prose-lg
    prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mb-6 prose-headings:mt-8
    prose-h1:text-3xl prose-h1:mb-8 prose-h1:mt-10 prose-h1:font-bold
    prose-h2:text-2xl prose-h2:mb-6 prose-h2:mt-8 prose-h2:font-semibold
    prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:font-medium
    prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-5
    prose-p:text-gray-700 prose-p:leading-8 prose-p:mb-6 prose-p:text-base
    prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-7
    prose-ul:mb-6 prose-ol:mb-6 prose-ul:space-y-2 prose-ol:space-y-2
    prose-ul:pl-6 prose-ol:pl-6
    prose-li:marker:text-mint-500 prose-li:marker:font-medium
    prose-strong:text-gray-900 prose-strong:font-semibold
    prose-em:text-gray-700 prose-em:italic
    prose-blockquote:border-mint-200 prose-blockquote:text-gray-600 prose-blockquote:bg-mint-50/30 prose-blockquote:p-6 prose-blockquote:my-8 prose-blockquote:rounded-lg
    prose-code:text-mint-700 prose-code:bg-mint-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
    prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:p-6 prose-pre:rounded-lg prose-pre:my-8 prose-pre:overflow-x-auto
    prose-hr:border-gray-200 prose-hr:my-10 prose-hr:border-t-2
    prose-table:border-collapse prose-table:border prose-table:border-gray-200 prose-table:my-8
    prose-th:border prose-th:border-gray-200 prose-th:bg-gray-50 prose-th:p-3 prose-th:font-semibold
    prose-td:border prose-td:border-gray-200 prose-td:p-3
    prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
  `;

  return (
    <div className={cn("flex flex-col bg-white", className)}>
      {/* Enhanced Header */}
      <div className="border-b border-border py-3 px-4 bg-gradient-to-r from-mint-50/30 to-white h-[73px] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className={cn("h-5 w-5", contentInfo.color)} />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{contentInfo.title}</h2>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span>{contentInfo.description}</span>
              {content && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3 w-3" />
                    <span>{wordCount} words</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{readingTime} min read</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {contentType !== 'original' && onRetryEnhancement && (
          <Button
            onClick={() => handleRetry(getEnhancementTypeFromContent(contentType))}
            disabled={retryLoading}
            variant="ghost"
            size="sm"
            className="text-mint-600 hover:text-mint-700 hover:bg-mint-50"
          >
            {retryLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-mint-600" />
            ) : (
              <RefreshCw className="h-4 w-4 text-mint-600" />
            )}
          </Button>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/30">
        <div className="p-8">
          {/* Route content based on type and AI enhancement markers */}
          {hasEnhancementMarkers ? (
            // Content with AI enhancement markers - use EnhancedContentRenderer for green highlighting
            <EnhancedContentRenderer 
              content={content} 
              fontSize={fontSize} 
              textAlign={textAlign}
              className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
            />
          ) : contentInfo.isMarkdown ? (
            // Pure markdown content without AI markers
            <div 
              className={markdownClasses}
              style={{ 
                fontSize: `${fontSize}px`,
                textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'justify',
                lineHeight: '1.8'
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {contentType === 'keyPoints' ? processKeyPoints(cleanMarkdownContent(content)) : cleanMarkdownContent(content)}
              </ReactMarkdown>
            </div>
          ) : (
            // Original content - use RichTextDisplay
            <RichTextDisplay 
              content={content} 
              fontSize={fontSize} 
              textAlign={textAlign}
              removeTitle={contentType !== 'original'}
              className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to map content type to enhancement type
const getEnhancementTypeFromContent = (contentType: EnhancementContentType): string => {
  switch (contentType) {
    case 'summary':
      return 'summarize';
    case 'keyPoints':
      return 'extract-key-points';
    case 'improved':
      return 'improve-clarity';
    case 'markdown':
      return 'convert-to-markdown';
    default:
      return 'summarize';
  }
};
