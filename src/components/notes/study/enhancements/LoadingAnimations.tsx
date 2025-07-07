
import { useState, useEffect } from "react";
import { Loader2, Brain, Sparkles, Zap, Wand2, Stars, Clock, CheckCircle } from "lucide-react";
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
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) return prev; // Don't complete until actual completion
        return prev + Math.random() * 3;
      });
    }, 1500);

    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, []);
  
  const getEstimatedTime = () => {
    if (timeElapsed < 15) return "Usually takes 10-30 seconds";
    if (timeElapsed < 45) return "Taking a bit longer, please wait...";
    return "Almost done, hang tight!";
  };
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
              {/* Main wand with complex animation */}
              <Wand2 className="h-12 w-12 text-purple-500 animate-bounce" />
              
              {/* Multiple pulsing rings */}
              <div className="absolute -inset-2 bg-purple-200 rounded-full animate-ping opacity-20"></div>
              <div className="absolute -inset-4 bg-purple-100 rounded-full animate-ping opacity-10 [animation-delay:0.5s]"></div>
              <div className="absolute -inset-6 bg-purple-50 rounded-full animate-ping opacity-5 [animation-delay:1s]"></div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-3 -left-3">
                <Stars className="h-3 w-3 text-yellow-400 animate-pulse [animation-delay:0.2s]" />
              </div>
              <div className="absolute -bottom-2 -right-4">
                <Sparkles className="h-4 w-4 text-pink-400 animate-pulse [animation-delay:0.8s]" />
              </div>
              <div className="absolute -top-4 right-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:1.2s]"></div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="text-purple-600 font-medium text-lg">Enhancing clarity</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.3s]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.6s]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.9s]"></div>
              </div>
              
              {/* Animated progress text */}
              <div className="text-sm text-purple-500 animate-pulse">
                Adding contextual explanations...
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
      
      case 'enrich-note':
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              {/* Central fire icon with pulsing effect */}
              <div className="text-6xl animate-pulse">🔥</div>
              
              {/* Expanding rings */}
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping opacity-30"></div>
              <div className="absolute -inset-2 border-2 border-orange-300 rounded-full animate-ping opacity-20 [animation-delay:0.5s]"></div>
              <div className="absolute -inset-4 border border-orange-400 rounded-full animate-ping opacity-10 [animation-delay:1s]"></div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-2 -left-2">
                <Sparkles className="h-5 w-5 text-yellow-400 animate-bounce [animation-delay:0.3s]" />
              </div>
              <div className="absolute -bottom-1 -right-3">
                <Stars className="h-4 w-4 text-orange-400 animate-bounce [animation-delay:0.8s]" />
              </div>
              <div className="absolute top-0 right-0">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse [animation-delay:1.2s]"></div>
              </div>
              <div className="absolute bottom-2 left-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse [animation-delay:0.6s]"></div>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="text-orange-600 font-bold text-xl">Enriching Your Note</div>
              <div className="text-orange-500 text-sm text-center max-w-xs">
                Adding detailed explanations, examples, and context...
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.6s]"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.8s]"></div>
              </div>
            </div>
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
    <div className={cn("p-12 bg-gradient-to-br from-mint-50/50 to-mint-100/30 rounded-xl border-2 border-mint-200/50 shadow-sm", className)}>
      <div className="space-y-8">
        {getAnimationForEnhancement()}
        
        {/* Progress Information */}
        <div className="text-center space-y-4">
          {/* Progress Bar */}
          <div className="w-64 bg-mint-100 rounded-full h-2 mx-auto">
            <div 
              className="bg-gradient-to-r from-mint-500 to-mint-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Time Information */}
          <div className="flex items-center justify-center space-x-2 text-mint-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{getEstimatedTime()}</span>
          </div>
          
          {/* Time Elapsed */}
          <div className="text-xs text-mint-600/80">
            Processing for {timeElapsed}s
          </div>
        </div>
      </div>
    </div>
  );
};
