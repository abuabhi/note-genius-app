
import { FileText, Target, List, Sparkles, Code } from "lucide-react";
import { EnhancementContentType } from "../EnhancementSelector";

export interface ContentInfo {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  isMarkdown: boolean;
}

export const getContentInfo = (contentType: EnhancementContentType): ContentInfo => {
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

// Helper function to map content type to enhancement type
export const getEnhancementTypeFromContent = (contentType: EnhancementContentType): string => {
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
