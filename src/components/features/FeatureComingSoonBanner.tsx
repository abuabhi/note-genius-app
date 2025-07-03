import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";

interface FeatureComingSoonBannerProps {
  title: string;
  description: string;
}

export const FeatureComingSoonBanner = ({ 
  title, 
  description 
}: FeatureComingSoonBannerProps) => {
  return (
    <div className="mt-6">
      <div className="relative bg-gradient-to-r from-mint-50 via-mint-100/60 to-mint-50 border-2 border-mint-200 rounded-xl p-6">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-mint-200/20 to-mint-300/20 rounded-full -mr-10 -mt-10 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-mint-200/15 to-mint-300/15 rounded-full -ml-8 -mb-8 opacity-60"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-mint-600 animate-pulse" />
              <Badge variant="outline" className="bg-mint-100 text-mint-800 border-mint-300 font-medium">
                Coming Soon
              </Badge>
            </div>
            
            <h3 className="font-semibold text-mint-900 mb-2 text-lg">
              {title}
            </h3>
            
            <p className="text-mint-700 text-sm leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-6">
            <Button 
              variant="outline" 
              className="border-2 border-mint-300 text-mint-700 hover:bg-mint-100 bg-white/80 shadow-sm hover:shadow-md transition-all"
              disabled
            >
              <Play className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};