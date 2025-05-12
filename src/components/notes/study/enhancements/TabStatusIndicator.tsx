
import React from "react";

interface TabStatusIndicatorProps {
  isGenerating?: boolean;
  hasError?: boolean;
}

export const TabStatusIndicator: React.FC<TabStatusIndicatorProps> = ({
  isGenerating = false,
  hasError = false
}) => {
  if (isGenerating) {
    return <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-mint-500 animate-pulse"></span>;
  }
  
  if (hasError) {
    return <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500"></span>;
  }
  
  return null;
};
