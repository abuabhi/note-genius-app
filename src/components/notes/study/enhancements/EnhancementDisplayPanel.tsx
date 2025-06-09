
import { useState } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { LoadingAnimations } from "./LoadingAnimations";
import { EnhancementContentType } from "./EnhancementSelector";
import { cn } from "@/lib/utils";
import { EnhancementHeader } from "./components/EnhancementHeader";
import { EnhancementEmptyState } from "./components/EnhancementEmptyState";
import { EnhancementContentRenderer } from "./components/EnhancementContentRenderer";
import { getContentInfo, getEnhancementTypeFromContent } from "./utils/contentInfo";

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

  const handleRetry = async (enhancementType: string) => {
    if (!onRetryEnhancement) return;
    
    setRetryLoading(true);
    try {
      await onRetryEnhancement(enhancementType);
    } finally {
      setRetryLoading(false);
    }
  };

  const content = getContent();
  const contentInfo = getContentInfo(contentType);
  const Icon = contentInfo.icon;

  // Check if content exists and is meaningful
  const hasContent = Boolean(
    content && 
    typeof content === 'string' && 
    content.trim().length > (contentType === 'improved' ? 20 : 10)
  );

  // Check for summary generation status specifically
  const isGeneratingSummary = contentType === 'summary' && 
    (note.summary_status === 'generating' || note.summary_status === 'pending');

  // Show loading state with tab-specific loading animation
  if (isLoading || isGeneratingSummary) {
    return (
      <div className={cn("flex flex-col bg-white", className)}>
        <EnhancementHeader
          title={contentInfo.title}
          description="Generating content..."
          icon={Icon}
          color={`${contentInfo.color} animate-pulse`}
          content=""
          contentType={contentType}
          onRetryEnhancement={undefined}
          retryLoading={false}
          getEnhancementTypeFromContent={getEnhancementTypeFromContent}
        />
        <div className="flex-1 flex items-center justify-center p-12">
          <LoadingAnimations />
        </div>
      </div>
    );
  }

  // Show empty state with generate option for non-original content
  if (!hasContent && contentType !== 'original') {
    return (
      <div className={cn("flex flex-col bg-white", className)}>
        <EnhancementHeader
          title={contentInfo.title}
          description={contentInfo.description}
          icon={Icon}
          color={contentInfo.color}
          content=""
          contentType={contentType}
          onRetryEnhancement={undefined}
          retryLoading={false}
          getEnhancementTypeFromContent={getEnhancementTypeFromContent}
        />
        <EnhancementEmptyState
          title={contentInfo.title}
          icon={Icon}
          onRetryEnhancement={handleRetry}
          retryLoading={retryLoading}
          getEnhancementTypeFromContent={getEnhancementTypeFromContent}
          contentType={contentType}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-white", className)}>
      {/* Enhanced Header */}
      <EnhancementHeader
        title={contentInfo.title}
        description={contentInfo.description}
        icon={Icon}
        color={contentInfo.color}
        content={content}
        contentType={contentType}
        onRetryEnhancement={handleRetry}
        retryLoading={retryLoading}
        getEnhancementTypeFromContent={getEnhancementTypeFromContent}
      />

      {/* Enhanced Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/30">
        <div className="p-8">
          <EnhancementContentRenderer
            content={content}
            contentType={contentType}
            fontSize={fontSize}
            textAlign={textAlign}
            isMarkdown={contentInfo.isMarkdown}
          />
        </div>
      </div>
    </div>
  );
};
