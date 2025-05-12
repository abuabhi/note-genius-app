
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { EnhancementTabHeader } from "./EnhancementTabHeader";
import { EnhancementContent } from "./EnhancementContent";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementContentType } from "./EnhancementSelector";
import { Note } from "@/types/note";

interface EnhancementDisplayPanelProps {
  note: Note;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => void;
  className?: string;
}

export const EnhancementDisplayPanel = ({
  note,
  contentType,
  fontSize,
  textAlign,
  isLoading = false,
  onRetryEnhancement,
  className
}: EnhancementDisplayPanelProps) => {
  // Get the appropriate content based on the selected content type
  const getContent = () => {
    switch (contentType) {
      case 'original':
        return note.content || note.description || "";
      case 'summary':
        return note.summary || "";
      case 'keyPoints':
        return note.key_points || "";
      case 'markdown':
        return note.markdown_content || "";
      case 'improved':
        return note.improved_content || "";
      default:
        return note.content || note.description || "";
    }
  };

  // Get the appropriate title based on the selected content type
  const getTitle = () => {
    switch (contentType) {
      case 'original':
        return "Original Note";
      case 'summary':
        return "Summary";
      case 'keyPoints':
        return "Key Points";
      case 'markdown':
        return "Markdown Format";
      case 'improved':
        return "Improved Clarity";
      default:
        return "Note Content";
    }
  };

  // Determine if this content type has a status
  const isGenerating = contentType === 'summary' && 
    (note.summary_status === 'generating' || note.summary_status === 'pending');
  const hasError = contentType === 'summary' && note.summary_status === 'failed';

  const content = getContent();
  const title = getTitle();
  const isMarkdownFormat = contentType === 'markdown';

  return (
    <div className={className}>
      <EnhancementTabHeader title={title} />
      {contentType === 'original' ? (
        <RichTextDisplay 
          content={content} 
          fontSize={fontSize} 
          textAlign={textAlign} 
        />
      ) : (
        <EnhancementContent
          content={content}
          title={title}
          fontSize={fontSize}
          textAlign={textAlign}
          isLoading={isGenerating || isLoading}
          hasError={hasError}
          isMarkdown={isMarkdownFormat}
          enhancementType={contentType}
          onRetry={onRetryEnhancement}
        />
      )}
    </div>
  );
};
