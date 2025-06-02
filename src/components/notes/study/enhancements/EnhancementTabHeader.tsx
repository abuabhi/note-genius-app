
import { Sparkles } from "lucide-react";

interface EnhancementTabHeaderProps {
  title: string;
  showAiIndicator?: boolean;
}

export const EnhancementTabHeader = ({ 
  title, 
  showAiIndicator = false 
}: EnhancementTabHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-mint-100">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold text-mint-800">{title}</h3>
        {showAiIndicator && (
          <div className="flex items-center space-x-1 bg-mint-100 text-mint-700 px-2 py-1 rounded-full text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            <span>AI Enhanced</span>
          </div>
        )}
      </div>
    </div>
  );
};
