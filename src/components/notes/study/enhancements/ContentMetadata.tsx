
import { Clock, FileText, Sparkles } from "lucide-react";

interface ContentMetadataProps {
  content: string;
  enhancementType?: string;
  className?: string;
}

export const ContentMetadata = ({
  content,
  enhancementType,
  className = ""
}: ContentMetadataProps) => {
  const calculateStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
    const characters = text.length;
    
    return { words, readingTime, characters };
  };

  const stats = calculateStats(content);

  const getEnhancementIcon = () => {
    switch (enhancementType) {
      case 'enrich-note':
        return <Sparkles className="h-4 w-4 text-orange-500" />;
      case 'summarize':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEnhancementLabel = () => {
    switch (enhancementType) {
      case 'enrich-note':
        return 'Enriched Content';
      case 'summarize':
        return 'Summary';
      case 'extract-key-points':
        return 'Key Points';
      case 'improve-clarity':
        return 'Improved Content';
      case 'convert-to-markdown':
        return 'Formatted Content';
      default:
        return 'Content';
    }
  };

  return (
    <div className={`flex items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600 ${className}`}>
      <div className="flex items-center gap-2">
        {getEnhancementIcon()}
        <span className="font-medium text-gray-700">{getEnhancementLabel()}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <FileText className="h-3 w-3" />
        <span>{stats.words.toLocaleString()} words</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{stats.readingTime} min read</span>
      </div>
      
      <div className="text-xs text-gray-500">
        {stats.characters.toLocaleString()} characters
      </div>
    </div>
  );
};
