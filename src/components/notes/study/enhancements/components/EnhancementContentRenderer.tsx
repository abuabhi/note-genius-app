
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { EnhancedContentRenderer } from "../EnhancedContentRenderer";
import { TextAlignType } from "../../hooks/useStudyViewState";
import { EnhancementContentType } from "../EnhancementSelector";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hasEnhancementMarkers, cleanMarkdownContent, processKeyPoints } from "../utils/contentProcessing";

interface EnhancementContentRendererProps {
  content: string;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isMarkdown: boolean;
}

export const EnhancementContentRenderer = ({
  content,
  contentType,
  fontSize,
  textAlign,
  isMarkdown
}: EnhancementContentRendererProps) => {
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

  // Route content based on type and AI enhancement markers
  if (hasEnhancementMarkers(content)) {
    // Content with AI enhancement markers - use EnhancedContentRenderer for green highlighting
    return (
      <EnhancedContentRenderer 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
      />
    );
  } else if (isMarkdown) {
    // Pure markdown content without AI markers
    return (
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
    );
  } else {
    // Original content - use RichTextDisplay
    return (
      <RichTextDisplay 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        removeTitle={contentType !== 'original'}
        className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
      />
    );
  }
};
