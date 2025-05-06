
import { Sparkles } from "lucide-react";

interface ProcessingIndicatorProps {
  useOpenAI: boolean;
  isPremiumUser: boolean;
  isEnhanced: boolean;
  language: string;
  getLanguageNameByCode: (code: string) => string;
}

export const ProcessingIndicator = ({
  useOpenAI,
  isPremiumUser,
  isEnhanced,
  language,
  getLanguageNameByCode
}: ProcessingIndicatorProps) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-700 mx-auto"></div>
        <p className="mt-4 text-sm text-mint-700">
          {useOpenAI && isPremiumUser ? (
            <>
              <Sparkles className="inline-block mr-1 h-4 w-4 text-blue-500" />
              Processing with OpenAI...
            </>
          ) : (
            <>Processing your image in {getLanguageNameByCode(language)}...</>
          )}
        </p>
        {isEnhanced && <p className="text-xs text-muted-foreground mt-1">With image enhancement</p>}
      </div>
    </div>
  );
};
