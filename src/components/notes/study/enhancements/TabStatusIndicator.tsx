
import { AlertCircle, Loader2 } from "lucide-react";

interface TabStatusIndicatorProps {
  isGenerating?: boolean;
  hasError?: boolean;
}

export const TabStatusIndicator: React.FC<TabStatusIndicatorProps> = ({
  isGenerating = false,
  hasError = false
}) => {
  if (!isGenerating && !hasError) {
    return null;
  }

  if (isGenerating) {
    return <Loader2 className="h-3 w-3 animate-spin absolute right-3 text-mint-500" />;
  }

  if (hasError) {
    return <AlertCircle className="h-3 w-3 absolute right-3 text-red-500" />;
  }

  return null;
};
