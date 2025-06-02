
import { Loader2 } from "lucide-react";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";

interface StudyViewProcessingIndicatorProps {
  processingEnhancement: EnhancementFunction | null;
}

export const StudyViewProcessingIndicator = ({
  processingEnhancement,
}: StudyViewProcessingIndicatorProps) => {
  const { enhancementOptions } = useNoteEnrichment();

  if (!processingEnhancement) return null;

  const getProcessingTitle = () => {
    const option = enhancementOptions.find(opt => opt.value === processingEnhancement);
    return option?.title || "";
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-mint-50 rounded-lg border border-mint-200">
      <Loader2 className="h-4 w-4 animate-spin text-mint-600" />
      <span className="text-sm text-mint-700 font-medium">
        {getProcessingTitle()}...
      </span>
    </div>
  );
};
