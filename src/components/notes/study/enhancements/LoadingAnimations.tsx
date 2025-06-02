
import { Loader2, Brain, Sparkles, Zap, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingAnimationsProps {
  enhancementType?: string;
  message?: string;
  className?: string;
}

export const LoadingAnimations = ({
  enhancementType = "",
  message = "Processing...",
  className
}: LoadingAnimationsProps) => {
  const getAnimationForEnhancement = () => {
    switch (enhancementType) {
      case 'summarize':
        return (
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-mint-500 animate-pulse" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-bounce" />
              </div>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-mint-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-mint-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-mint-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        );
      
      case 'extract-key-points':
        return (
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Zap className="h-8 w-8 text-blue-500 animate-spin" />
              <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-ping"></div>
            </div>
            <div className="text-blue-600 font-medium">Extracting key insights...</div>
          </div>
        );
      
      case 'improve-clarity':
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <Wand2 className="h-10 w-10 text-purple-500 animate-bounce" />
              <div className="absolute -inset-2 bg-purple-200 rounded-full animate-ping opacity-20"></div>
              <div className="absolute -inset-4 bg-purple-100 rounded-full animate-ping opacity-10 [animation-delay:0.5s]"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-purple-600 font-medium">Enhancing clarity</div>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        );
      
      case 'convert-to-markdown':
        return (
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-green-600 font-medium">Converting to markdown...</div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-mint-500" />
            <div className="text-mint-600 font-medium">{message}</div>
          </div>
        );
    }
  };

  return (
    <div className={cn("p-8 bg-gradient-to-br from-mint-50 to-blue-50 rounded-lg border border-mint-200", className)}>
      {getAnimationForEnhancement()}
    </div>
  );
};
