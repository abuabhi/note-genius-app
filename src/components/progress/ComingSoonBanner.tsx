
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";

interface ComingSoonBannerProps {
  title: string;
  description: string;
  size?: "default" | "large";
}

export const ComingSoonBanner = ({ 
  title, 
  description, 
  size = "default" 
}: ComingSoonBannerProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className={`relative bg-gradient-to-r from-mint-50 via-blue-50 to-mint-50 border-2 border-mint-200 rounded-lg ${
        size === "large" ? "p-6" : "p-4"
      } mb-6`}>
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-mint-200/30 to-blue-200/30 rounded-full -mr-10 -mt-10 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-200/20 to-mint-200/20 rounded-full -ml-8 -mb-8 opacity-60"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-mint-600 animate-pulse" />
                <Badge variant="outline" className="bg-mint-100 text-mint-800 border-mint-300 font-medium animate-pulse">
                  Coming Soon
                </Badge>
              </div>
            </div>
            
            <h3 className={`font-semibold text-mint-900 mb-1 ${
              size === "large" ? "text-lg" : "text-base"
            }`}>
              {title}
            </h3>
            
            <p className={`text-mint-700 ${
              size === "large" ? "text-base" : "text-sm"
            }`}>
              {description}
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-4">
            <div className="relative">
              <Zap className="h-8 w-8 text-mint-500 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-mint-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
